Rails.application.routes.draw do
  
  # トップページ
  root to: "home#index"
  
  # ユーザ
  devise_for :users
  
  # エッジ
  resources :edges, only: [:index, :show, :new, :create, :destroy] do
    collection do
      get :users
    end
  end
  
  # ノード
  resources :nodes, only: [:show]
  
  # フォロー
  resources :follows, only: [:create, :destroy] do
    collection do
      get :followings
      get :followers
    end
  end

end
