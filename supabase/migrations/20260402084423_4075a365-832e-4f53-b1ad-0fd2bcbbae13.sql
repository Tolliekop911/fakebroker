CREATE POLICY "Users can create their own accounts"
ON public.accounts
FOR INSERT
WITH CHECK (auth.uid() = user_id);