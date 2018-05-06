class User < ApplicationRecord
  
  validates :name, presence: true, length: { maximum: 20 }

  validates :email, presence: true, length: { maximum: 255 },
                    format: { with: /\A[\w+\-.]+@[a-z\d\-.]+\.[a-z]+\z/i }

  has_many :edges
  
  # followsを経由してto_userを取得するfollowingsを定義
  has_many :follows, class_name: 'Follow', foreign_key: 'from_user'
  has_many :followings, through: :follows, source: :to_user
  
  # reverses_of_followsを経由してfrom_userを取得するfollowersを定義
  has_many :reverses_of_follows, class_name: 'Follow', foreign_key: 'to_user'
  has_many :followers, through: :reverses_of_follows, source: :from_user
  
  
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable
  
end
