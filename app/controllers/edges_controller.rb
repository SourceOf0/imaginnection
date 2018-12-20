class EdgesController < ApplicationController
  
  before_action :set_debug_view if ENV['DEBUG_VIEW'] == 'true'
  
  # deviseでのログイン認証をスキップする
  skip_before_action :authenticate_user!, only: [:show, :world]
  
  def index
    @view_ref_ids = current_user.followings.map(&:ref_id).unshift(current_user.ref_id)
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
        set_logger( 'edge/show', @target_user.ref_id + " : " + @target_user.name )
        render :index
      else
        set_logger( 'edge/show', 'this user hide map' )
      end
    else
      set_logger( 'edge/show', 'user not found' )
    end
  end
  
  def world
    @view_ref_ids = User.where(deleted_at: nil, is_hide_edges: false).map(&:ref_id)
    @is_hide_user = true
    
    set_index_data()
    set_logger( 'edge/world', @view_ref_ids.count.to_s )
    render :index
  end
  
  def users
    # 未ログインでも表示可能のため注意
    @from_node = Node.new(name: params[:from_node])
    @to_node = Node.new(name: params[:to_node])
    @forward = create_users_data(params[:forward_data])
    @backward = create_users_data(params[:backward_data])
    set_logger( 'edge/users', @from_node.name + ' -> ' + @to_node.name )
  end

  def new
    @from_node = Node.new(name: params[:node_name])
    set_logger( 'edge/new', @from_node.name )
  end
  
  
  def create
    @from_node = Node.new(name: params[:from_node_name])
    @to_node = Node.new(name: params[:to_node_name])
    @is_hide_user = !!params[:is_hide_user]
    set_logger( 'edge/create', @from_node.name + ' -> ' + @to_node.name )
  end
  
  
  def destroy
    @from_node = Node.new(name: params[:from_node_name])
    @to_node = Node.new(name: params[:to_node_name])
    @is_hide_user = false
    set_logger( 'edge/destroy', @from_node.name + ' -> ' + @to_node.name )
  end
  
  
  private
  
  # Strong Paramter
  def node_params
    params.require(:node).permit(:name)
  end
  
  def create_custom_token(uid)
    service_account_email = ENV['SERVICE_ACCOUNT_EMAIL']
    private_key = OpenSSL::PKey::RSA.new(ENV['PRIVATE_KEY'].gsub("\\n", "\n"))
    now_seconds = Time.now.to_i
    payload = {
      :iss => service_account_email,
      :sub => service_account_email,
      :aud => "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit",
      :iat => now_seconds,
      :exp => now_seconds+(60*60), # 有効時間
      :uid => uid,
      #:claims => {追加情報あれば},
    }
    return JWT.encode(payload, private_key, "RS256")
  end
    
  def set_index_data
    @json_data = {}
    
    @json_data[:view_ids] = @view_ref_ids
    
    if user_signed_in?
      @json_data[:current_id] = current_user.ref_id
      @json_data[:token] = create_custom_token(current_user.ref_id)
      if action_name != "world"
        @json_data[:map_user_id] = (@target_user)? @target_user.ref_id : current_user.ref_id
        @json_data[:map_user_name] = (@target_user)? @target_user.name : current_user.name
      end
    end

    @from_node = Node.new
    @to_node = Node.new
  end

  def create_users_data(data)
    is_hide_user = !!data[:is_hide_user]
    users = User.where(ref_id: data[:content], deleted_at: nil)
    return {
      is_hide_user: is_hide_user,
      users: users,
      count: data[:count],
      is_owner: user_signed_in? && (is_hide_user || users.include?(current_user)),
    }
  end
  
  def set_debug_view
    @is_debug_view = true
  end
end
