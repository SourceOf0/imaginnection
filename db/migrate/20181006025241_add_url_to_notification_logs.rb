class AddUrlToNotificationLogs < ActiveRecord::Migration[5.1]
  def change
    add_column :notification_logs, :url, :text
  end
end
