class FollowsController < ApplicationController
  
  def followings
    @followings = current_user.followings
  end
  
  def followers
    @followers = current_user.followers
  end

  def create
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
    @user = User.find_by(ref_id: params[:id])
    current_user.unfollow(@user)
    #flash[:success] = 'ユーザのフォローを解除しました。'
  end
  
end
