class EdgesController < ApplicationController
  
  before_action :set_debug_view if ENV['DEBUG_VIEW'] == 'true'
  
  # deviseでのログイン認証をスキップする
  skip_before_action :authenticate_user!, only: [:show]
  
  def index
    @view_ref_ids = current_user.followings.map(&:ref_id).push(current_user.ref_id)
    @is_hide_user = current_user.is_hide_edges
    
    set_index_data()
    set_logger( 'edge/index', @view_ref_ids.to_json )
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
        
        set_index_data()
        set_logger( 'edge/show', @target_user.name + " : " + @target_user.ref_id )
        render :index
      else
        set_logger( 'edge/show', 'this user hide map' )
      end
    else
      set_logger( 'edge/show', 'user not found' )
    end
  end
  
  def users
    # 未ログインでも表示可能のため注意
    @from_node = Node.new(name: params[:from_node])
    @to_node = Node.new(name: params[:to_node])
    @is_hide_user = !!params[:is_hide_user]
    @users = User.where(ref_id: params[:content], deleted_at: nil)
    @count = params[:count];
    @is_owner = user_signed_in? && (@is_hide_user || @users.include?(current_user))
    set_logger( 'edge/users', @from_node.name + ' -> ' + @to_node.name )
  end

  def new
    @from_node = Node.new(node_params)
    set_logger( 'edge/new', @from_node.name )
  end
  
  
  def create
    @from_node = Node.new(name: params[:from_node_name])
    @to_node = Node.new(node_params)
    @is_hide_user = !!params[:is_hide_user]
    set_logger( 'edge/create', @from_node.name + ' -> ' + @to_node.name )
  end
  
  
  def destroy
    @from_node = Node.new(name: params[:from_node_name])
    @to_node = Node.new(node_params)
    @is_hide_user = false
    set_logger( 'edge/destroy', @from_node.name + ' -> ' + @to_node.name )
  end
  
  
  private
  
  # Strong Paramter
  def node_params
    params.require(:node).permit(:name)
  end
  
  def set_index_data
    @json_data = {
      current_id: (user_signed_in?)? current_user.ref_id : '',
      map_user_id: (@target_user)? @target_user.ref_id : (user_signed_in?)? current_user.ref_id : '',
      map_user_name: (@target_user)? @target_user.name : (user_signed_in?)? current_user.name : '',
      view_ids: @view_ref_ids,
    }

    @from_node = Node.new
    @to_node = Node.new
  end
  
  def set_debug_view
    @is_debug_view = true
  end
end
