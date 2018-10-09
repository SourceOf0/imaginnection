class NotificationLogsController < ApplicationController
  
  def create
    # エッジの通知作成
    data = params[:data].as_json
    
    if !!data
      data.each do |gaze, edge|
        words = []
        edge.each do |name, state|
          state['data']['users'].each do |user_id, user_data|
            if user_data['is_hide_user'] == 'false' && user_id != current_user.ref_id
              words.push(name)
            end
          end
        end
        
        if words.length <= 3
          # 個別で通知
          words.each do |name|
            current_user.notification_logs.create(content: '「' + name + '」に共感者が増えました')
          end
        else
          # 纏めて通知
          current_user.notification_logs.create(content: '「' + gaze + '」の連想単語＋' + words.length.to_s + '個（「' + words.join('」 「') + '」）')
        end
      end
    end
    
    @notifications = current_user.notification_logs
  end

  def destroy
    @notification_id = params[:id]
    notification = current_user.notification_logs.find( @notification_id )
    notification.destroy if notification
    @notification_count = current_user.notification_logs.count
  end
  
end
