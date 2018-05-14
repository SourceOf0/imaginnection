class NodesController < ApplicationController
  
  def index
  end

  def show
  end

  def new
    @from_node = Node.new;
  end
  
end
