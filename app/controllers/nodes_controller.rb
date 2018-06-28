class NodesController < ApplicationController
  
  def show
  end


  private
  
  # Strong Paramter
  def node_params
    params.require(:node).permit(:name)
  end

end
