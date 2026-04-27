import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationId, userId, userEmail, userName, isAnonymous } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user is banned from chat
    if (userEmail) {
      const { data: activeBan } = await supabase
        .from("chat_bans")
        .select("id, expires_at, ban_reason")
        .eq("user_email", userEmail.toLowerCase())
        .gt("expires_at", new Date().toISOString())
        .limit(1)
        .single();

      if (activeBan) {
        const expiresAt = new Date(activeBan.expires_at);
        const formattedExpiry = expiresAt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        
        return new Response(
          JSON.stringify({
            message: `You have been temporarily banned from chat support due to terms of service violations. Your ban expires on ${formattedExpiry}. If you believe this is an error, please contact support@kuberamarkets.com`,
            conversationId: null,
            banned: true,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Profanity detection - common swear words and variations
    const profanityPatterns = [
      /\bf+u+c+k+/gi, /\bs+h+i+t+/gi, /\ba+s+s+h+o+l+e+/gi, /\bb+i+t+c+h+/gi,
      /\bd+a+m+n+/gi, /\bc+u+n+t+/gi, /\bd+i+c+k+/gi, /\bp+i+s+s+/gi,
      /\bw+h+o+r+e+/gi, /\bb+a+s+t+a+r+d+/gi, /\bf+a+g+/gi, /\bn+i+g+g+/gi,
      /\bstfu\b/gi, /\bwtf\b/gi, /\bffs\b/gi, /\bfu\b/gi,
    ];
    
    const containsProfanity = profanityPatterns.some(pattern => pattern.test(message));
    
    if (containsProfanity) {
      let activeConversationId = conversationId;
      
      // Create conversation if needed for tracking
      if (!activeConversationId) {
        const { data: newConversation } = await supabase
          .from("conversations")
          .insert({
            user_id: userId || null,
            user_email: userEmail || null,
            user_name: userName || null,
            is_anonymous: isAnonymous || false,
            status: "active",
          })
          .select()
          .single();
        activeConversationId = newConversation?.id;
      }
      
      // Save the user message (even if profane, for records)
      if (activeConversationId) {
        await supabase.from("chat_messages").insert({
          conversation_id: activeConversationId,
          sender_type: "user",
          sender_id: userId || null,
          content: message,
        });
        
        // Save warning message
        const warningMessage = "Please keep the conversation respectful. Using inappropriate language violates our terms of service and continued violations may result in your account being suspended or banned. How can I help you today?";
        await supabase.from("chat_messages").insert({
          conversation_id: activeConversationId,
          sender_type: "ai",
          content: warningMessage,
        });
      }
      
      return new Response(
        JSON.stringify({
          message: "Please keep the conversation respectful. Using inappropriate language violates our terms of service and continued violations may result in your account being suspended or banned. How can I help you today?",
          conversationId: activeConversationId,
          warning: true,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let activeConversationId = conversationId;

    // Create or get conversation
    if (!activeConversationId) {
      const { data: newConversation, error: convError } = await supabase
        .from("conversations")
        .insert({
          user_id: userId || null,
          user_email: userEmail || null,
          user_name: userName || null,
          is_anonymous: isAnonymous || false,
          status: "active",
        })
        .select()
        .single();

      if (convError) {
        console.error("Error creating conversation:", convError);
        return new Response(JSON.stringify({ error: "Failed to create conversation" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      activeConversationId = newConversation.id;
    }

    // Save user message
    const { error: userMsgError } = await supabase.from("chat_messages").insert({
      conversation_id: activeConversationId,
      sender_type: "user",
      sender_id: userId || null,
      content: message,
    });

    if (userMsgError) {
      console.error("Error saving user message:", userMsgError);
    }

    // Get conversation history for context
    const { data: history } = await supabase
      .from("chat_messages")
      .select("sender_type, content")
      .eq("conversation_id", activeConversationId)
      .order("created_at", { ascending: true })
      .limit(20);

    const messages = [
      {
        role: "system",
        content: `You are a helpful customer support assistant for Kubera Markets, a prop trading firm and CFD broker. 

Your knowledge includes:
- Prop trading programs: 1 Step, 2 Step, and Halfway There programs
- Profit targets: Phase 1 is 8%, Phase 2 is 5%
- Drawdown limits: Max 10% overall, 4% daily
- Minimum trading days: 5 days per phase
- Profit split: 80% for funded traders
- Account sizes: $5K to $200K
- For CFD brokerage: Standard trading services with competitive spreads

Guidelines:
1. Be friendly, professional, and concise
2. If you can answer a question confidently, do so
3. If the question is complex, requires account-specific information, or you're unsure, offer to connect them with a live agent
4. For account-specific issues (payouts, account status, verification), offer to connect them with a live agent
5. Never make up information - if unsure, say so
6. IMPORTANT: Write in plain text only. Do NOT use any markdown formatting like asterisks, bold, italics, bullet points, or headers. Write naturally as if speaking to someone.

CRITICAL: When a user asks to speak to a human, live person, real agent, or wants human support:
- Respond with [ESCALATE] at the start of your message
- Tell them you are connecting them with a live support agent right now
- Let them know an agent will respond shortly in this same chat
- Example: "[ESCALATE] I'm connecting you with a live support agent now. Please stay in this chat - a team member will respond to you shortly."

If the user wants to speak to a human or their issue requires human intervention, respond with [ESCALATE] at the start of your message.`,
      },
    ];

    // Add conversation history
    if (history && history.length > 0) {
      for (const msg of history.slice(-10)) {
        messages.push({
          role: msg.sender_type === "user" ? "user" : "assistant",
          content: msg.content,
        });
      }
    }

    // Current message
    messages.push({ role: "user", content: message });

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    let aiMessage = aiData.choices?.[0]?.message?.content || "I apologize, but I'm having trouble responding. Please try again.";

    // Check if escalation is needed
    let shouldEscalate = aiMessage.includes("[ESCALATE]");
    if (shouldEscalate) {
      aiMessage = aiMessage.replace("[ESCALATE]", "").trim();
      
      // Update conversation status to escalated
      await supabase
        .from("conversations")
        .update({ status: "escalated", escalated_at: new Date().toISOString() })
        .eq("id", activeConversationId);

      // Create a ticket
      if (userId) {
        await supabase.from("tickets").insert({
          user_id: userId,
          subject: `Chat Escalation - ${message.substring(0, 50)}...`,
          message: `User requested human support. Last message: ${message}`,
          status: "open",
          priority: "high",
        });
      }
    }

    // Save AI response
    const { error: aiMsgError } = await supabase.from("chat_messages").insert({
      conversation_id: activeConversationId,
      sender_type: "ai",
      content: aiMessage,
    });

    if (aiMsgError) {
      console.error("Error saving AI message:", aiMsgError);
    }

    return new Response(
      JSON.stringify({
        message: aiMessage,
        conversationId: activeConversationId,
        escalated: shouldEscalate,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
