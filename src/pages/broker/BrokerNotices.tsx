import BrokerDashboardLayout from "@/components/broker/BrokerDashboardLayout";
import { Bell, AlertCircle, Info, CheckCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// This would normally come from a notifications/notices table
// For now showing empty state

const BrokerNotices = () => {
  const [notices, setNotices] = useState<any[]>([]);

  const getNoticeIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "alert":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-broker-primary" />;
    }
  };

  const markAsRead = (id: string) => {
    setNotices(notices.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotices(notices.map(n => ({ ...n, read: true })));
  };

  const deleteNotice = (id: string) => {
    setNotices(notices.filter(n => n.id !== id));
  };

  const unreadCount = notices.filter(n => !n.read).length;

  return (
    <BrokerDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold">Notices</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              onClick={markAllAsRead}
              className="text-broker-primary border-broker-primary hover:bg-broker-primary/10"
            >
              Mark All as Read
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {notices.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No Notifications</h3>
              <p className="text-sm text-muted-foreground">You're all caught up!</p>
            </div>
          ) : (
            notices.map((notice) => (
              <div 
                key={notice.id} 
                className={`bg-card border rounded-xl p-6 transition-colors cursor-pointer ${
                  notice.read ? 'border-border' : 'border-broker-primary/50 bg-broker-primary/5'
                }`}
                onClick={() => markAsRead(notice.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {getNoticeIcon(notice.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{notice.title}</h3>
                        {!notice.read && (
                          <span className="w-2 h-2 bg-broker-primary rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{notice.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">{notice.date}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotice(notice.id);
                    }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </BrokerDashboardLayout>
  );
};

export default BrokerNotices;
