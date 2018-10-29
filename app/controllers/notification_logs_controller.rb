class NotificationLogsController < ApplicationController
  
  # 通知生成が重複するためcreateでは通知チェックをスキップする
  skip_before_action :check_notification, only: [:create]
  
  def show
    # js側でリンク先を表示しつつ対象の通知を削除
    @notification_id = params[:id]
    notification = current_user.notification_logs.find( @notification_id )
    
    @notification_url = notification.url
    
    notification.destroy if notification
    @notification_count = current_user.notification_logs.count
    
    render :destroy
  end

  def create
    # エッジの通知作成
    data = params[:data].as_json
    
    if current_user.notified_at >= Time.now.ago(10.second)
      render status: 400, json: { status: 400, message: 'Bad Request' }
      return
    elsif !!data
      data.each do |gaze, edge|
        words = []
        edge.each do |name, state|
          count = 0
          state['data'].each do |user_id, user_data|
            if user_id != current_user.ref_id
              count += 1
            end
          end
          if count > 0
            words.push({name: name, from_node: state['from_node'], to_node: state['to_node'], count: count})
          end
        end
        
        # 個別で通知作成
        words.each do |view_data|
          current_user.notification_logs.create(
            content: '<span class="label label-info">+' + view_data[:count].to_s + '人</span>「' + ERB::Util.html_escape(view_data[:from_node]) + '」→「' + ERB::Util.html_escape(view_data[:to_node]) + '」',
            url: edges_path(anchor: view_data[:from_node] + "&" + view_data[:to_node] )
          )
        end
      end
    end

    update_notification()
  end

  def destroy
    notification = current_user.notification_logs.find_by_id( params[:id] )
    notification.destroy if notification
    @notifications = current_user.notification_logs.order('created_at DESC')
  end
  
end
