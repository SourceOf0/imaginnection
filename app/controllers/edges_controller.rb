class EdgesController < ApplicationController
  
  def index
    #@edge_list = Edge.viewable_uniq_edges(current_user)
    #@nodes_count = Edge.viewable_node_counts(current_user)
    @current_ref_id = current_user.ref_id
    @view_ref_ids = current_user.followings.map(&:ref_id).push(@current_ref_id)
  end

  def show
    #edge = Edge.find(params[:id])
    #@users = Edge.connected_users(edge.from_node, edge.to_node)
    @users = User.where(ref_id: params[:content].keys)
    @edge_id = params[:id]
  end

  def new
    @current_ref_id = current_user.ref_id
    @view_ref_ids = current_user.followings.map(&:ref_id).push(@current_ref_id)
    
    @from_node = Node.new(node_params)
    @to_node = Node.new
  end
  
  
  def create
    @current_ref_id = current_user.ref_id
    @from_node_name = params[:from_node_name]
    @to_node = Node.new(node_params)
    @to_node_name = @to_node.name
    @is_hide_user = !!params[:is_hide_user]
    
=begin
    if !@to_node
      @to_node = Node.new(node_params)
      if !@to_node.save
        flash.now[:danger] = 'エッジの追加に失敗しました'
        render :new
        return
      end
    elsif @from_node.id == @to_node.id
      flash.now[:danger] = '同名ノードをエッジに登録することはできません'
      render :new
      return
    end
    @edge = current_user.edges.create(from_node_id: @from_node.id, to_node_id: @to_node.id)
    flash[:success] = 'エッジを追加しました'
    redirect_to edges_path
=end
  end
  
  
  def destroy
  end
  
  
  private
  
  # Strong Paramter
  def node_params
    params.require(:node).permit(:name)
  end

end
