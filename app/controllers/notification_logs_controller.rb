class NotificationLogsController < ApplicationController
  
  def create
    # エッジの通知作成
    return
    # TODO
    @user = User.find_by(ref_id: params[:id])
    if !current_user.can_follow?(@user)
      @user = nil
      #flash[:warning] = 'ユーザをフォローできません。'
    elsif current_user.following?(@user) 
      @user = nil
      #flash[:warning] = 'すでにユーザをフォローしています。'
    else
      current_user.follow(@user)
      #flash[:success] = 'ユーザをフォローしました。'
    end
  end

  def destroy
    @notification_id = params[:id]
    notification = current_user.notification_logs.find( @notification_id )
    notification.destroy if notification
    @notification_count = current_user.notification_logs.count
  end
  
end
