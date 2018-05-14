class HomeController < ApplicationController
  
  # deviseでのログイン認証をスキップする
  skip_before_action :authenticate_user!
  
  def index
  end
  
end
