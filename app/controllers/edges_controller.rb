class EdgesController < ApplicationController
  
  def index
    @edges = current_user.edges;
  end

  def show
  end

  def new
    @edge = current_user.edges.build()
    @edge.from_node = Node.new(node_params)
  end

  def create
    @edge = current_user.edges.build(edge_params)
    binding.pry
    if @edge.save
      flash[:success] = 'タスクを追加しました';
      redirect_to edges_path;
    else
      @from_node = Node.new(@edge.from_node.name)
      flash.now[:danger] = 'タスクの追加に失敗しました';
      render :new;
    end
  end
  
  def destroy
  end
  
  
  private
  
  # Strong Paramter
  def edge_params
    params.require(:edge).permit(
        from_node_attributes: [:name],
        to_node_attributes: [:name]
      )
  end
  def node_params
    params.require(:node).permit(:name)
  end
  
end
