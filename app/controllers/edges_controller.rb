class EdgesController < ApplicationController
  
  #before_action :set_debug
  
  def index
    @view_ref_ids = current_user.followings.map(&:ref_id).push(current_user.ref_id)
    
    @from_node = Node.new
    @to_node = Node.new
  end

  def show
    @target_user = User.find_by(ref_id: params[:id])

    if @target_user.is_hide_edges
      return
    end

    @view_ref_ids = @target_user.followings.map(&:ref_id).push(@target_user.ref_id)
    
    @from_node = Node.new
    @to_node = Node.new

    render :index
  end
  
  def users
    @from_node = Node.new(name: params[:from_node])
    @to_node = Node.new(name: params[:to_node])
    @is_hide_user = !!params[:is_hide_user]
    @users = User.where(ref_id: params[:content])
    @count = params[:count];
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
    @from_node = params[:from_node_name]
    @to_node = params[:to_node_name]
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
