Rails.application.routes.draw do
  
  # トップページ
  root to: "home#index"
  
  # ユーザ
  devise_for :users, controllers: {
    sessions: 'users/sessions'
  }
  
  # メールログ
  if Rails.env.development?
    mount LetterOpenerWeb::Engine, at: "/letter_opener"
  end
  
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
