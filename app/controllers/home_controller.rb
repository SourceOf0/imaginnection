class HomeController < ApplicationController
  
  # deviseでのログイン認証をスキップする
  skip_before_action :authenticate_user!
  
  def index
    if user_signed_in?
      redirect_to edges_path
    end
  end
  
  def terms
    # do nothing.
  end
  
  def policy
    # do nothing.
  end

end
