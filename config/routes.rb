Rails.application.routes.draw do
  
  # トップページ
  root to: "home#index"

  # ユーザ
  devise_for :users, module: :users
  
  # メールログ
  if Rails.env.development?
    mount LetterOpenerWeb::Engine, at: "/letter_opener"
  end
  
  # 通知
  resources :notification_logs, only: [:show, :create, :destroy]
  
  # エッジ
  resources :edges, only: [:index, :show, :new, :create, :destroy] do
    collection do
      get :world
      get :users
    end
  end
  
  # ノード
  #resources :nodes, only: [:show]
  
  # フォロー
  resources :follows, only: [:create, :destroy] do
    collection do
      get :followings
      get :followers
    end
  end

  # 問い合わせ
  get 'inquiry', to: 'inquiry#index'
  post 'confirm', to: 'inquiry#confirm'
  post 'send', to: 'inquiry#send_mail'
  
  # その他ページ
  get 'terms', to: 'home#terms'
  get 'policy', to: 'home#policy'
  post 'logs', to: 'home#logs'

end
