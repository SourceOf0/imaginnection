require 'rails_helper'

RSpec.describe FollowsController, type: :controller do
  
  describe "GET #followers" do
    it "returns http success" do
      login_user
      get :followers
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET #followings" do
    it "returns http success" do
      login_user
      get :followings
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET #create" do
    it "returns http success" do
      login_user
      #get :create
      #expect(response).to have_http_status(:success)
    end
  end

  describe "GET #destroy" do
    it "returns http success" do
      login_user
      #get :destroy
      #expect(response).to have_http_status(:success)
    end
  end

end
