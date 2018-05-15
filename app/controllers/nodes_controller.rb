class NodesController < ApplicationController
  
  def index
  end

  def show
  end

  def new
    @from_node = Node.new
  end
  
  
  def create
    @from_node = Node.find_by(name: node_params[:name])
    if !@from_node
      @from_node = Node.new(node_params)
      if !@from_node.save
        flash.now[:danger] = 'ノードの追加に失敗しました'
        render :new
        return
      end
    end
    redirect_to new_edge_path(from_node_id: @from_node.id)
  end
  
  
  private
  
  # Strong Paramter
  def node_params
    params.require(:node).permit(:name)
  end

end
