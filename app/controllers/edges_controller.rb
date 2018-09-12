class EdgesController < ApplicationController
  
  #before_action :set_debug
  
  # deviseでのログイン認証をスキップする
  skip_before_action :authenticate_user!, only: [:show]
  
  def index
    @view_ref_ids = current_user.followings.map(&:ref_id).push(current_user.ref_id)
    @is_hide_user = current_user.is_hide_edges
    
    @from_node = Node.new
    @to_node = Node.new
  end

  def show
    @target_user = User.find_by(ref_id: params[:id])
    @is_active_user = !!@target_user && @target_user.active_for_authentication?
    
    if @is_active_user
      # 有効なユーザ
      @is_hide_user = @target_user.is_hide_edges
  
      if !@is_hide_user || @target_user == current_user
        # マップが公開中、またはログインユーザ
        @view_ref_ids = [@target_user.ref_id]
        
        @from_node = Node.new
        @to_node = Node.new
    
        render :index
      end
    end
    
  end
  
  def users
    # 未ログインでも表示可能のため注意
    @from_node = Node.new(name: params[:from_node])
    @to_node = Node.new(name: params[:to_node])
    @is_hide_user = !!params[:is_hide_user]
    @users = User.where(ref_id: params[:content], deleted_at: nil)
    @count = params[:count];
    if user_signed_in? && params[:content]
      @is_owner = !!params[:content].include?(current_user.ref_id);
    else
      @is_owner = false;
    end
  end

  def new
    @from_node = Node.new(node_params)
  end
  
  
  def create
    @from_node = Node.new(name: params[:from_node_name])
    @to_node = Node.new(node_params)
    @is_hide_user = !!params[:is_hide_user]
  end
  
  
  def destroy
    @from_node = Node.new(name: params[:from_node_name])
    @to_node = Node.new(node_params)
    @is_hide_user = false
  end
  
  
  private
  
  # Strong Paramter
  def node_params
    params.require(:node).permit(:name)
  end

  def set_debug
    @is_view_edges_list = true
  end
end
