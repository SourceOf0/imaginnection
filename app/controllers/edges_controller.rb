class EdgesController < ApplicationController
  
  def index
    @edge_list = Edge.viewable_uniq_edges(current_user)
    @nodes_count = Edge.viewable_node_counts(current_user)
  end

  def show
    edge = Edge.find(params[:id])
    @users = Edge.connected_users(edge.from_node, edge.to_node)
  end

  def new
    @from_node = Node.find(params[:from_node_id])
    @to_node = Node.new
  end
  
  
  def create
    @from_node = Node.find(params[:from_node_id])
    @to_node = Node.find_by(name: node_params[:name])
    
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
  end
  
  
  def destroy
  end
  
  
  private
  
  # Strong Paramter
  def node_params
    params.require(:node).permit(:name)
  end

end
