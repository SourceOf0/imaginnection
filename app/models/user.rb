class User < ApplicationRecord
  validates :name, presence: true, length: { maximum: 20 }

  validates :email, presence: true, length: { maximum: 255 }, uniqueness: true,
                    format: { with: /\A[\w+\-.]+@[a-z\d\-.]+\.[a-z]+\z/i }

  #validates :deleted_at
  
  #validates :ref_id
  #validates :is_disable_follow
  #validates :is_hide_edges
  
  validates :empathy_button_kind, presence: true,
    numericality: {
      only_integer: true, greater_than_or_equal_to: 0
    }
  
  validates :notified_at, presence: true


  has_many :edges, dependent: :destroy
  has_many :gazes, dependent: :destroy
  has_many :notification_logs, dependent: :destroy
  
  # followsを経由してto_userを取得するfollowingsを定義
  has_many :follows, class_name: 'Follow', foreign_key: 'from_user_id', dependent: :destroy
  has_many :followings, through: :follows, source: :to_user
  
  # reverses_of_followsを経由してfrom_userを取得するfollowersを定義
  has_many :reverses_of_follows, class_name: 'Follow', foreign_key: 'to_user_id', dependent: :destroy
  has_many :followers, through: :reverses_of_follows, source: :from_user
  
  
  # Include devise modules.
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable,
         :confirmable, :lockable, :timeoutable, :omniauthable
  
  
  # デフォルト値設定
  before_validation do
    self.ref_id = SecureRandom::urlsafe_base64(30) if self.ref_id.nil?
    self.is_disable_follow = false if self.is_disable_follow.nil?
    self.is_hide_edges = false if self.is_hide_edges.nil?
    self.notified_at = Date.current.in_time_zone if self.notified_at.nil?
    self.empathy_button_kind = 0 if self.empathy_button_kind.nil?
    
    # validationを継続
    true
  end

  # アカウントを削除する
  def soft_delete
    update(deleted_at: Time.now)
  end
  
  # アカウントか有効かどうか
  def active_for_authentication?
    super && self.deleted_at.nil?
  end
  
  # deviceメッセージのオーバーライド
  def inactive_message
    self.deleted_at.nil? ? super : :deleted_account
  end
  
  
  # 通知日を現在に更新する
  def update_notified_at
    self.notified_at = Date.current.in_time_zone
  end
  
  # 通知日よりも新しいフォロワーを取得
  # @return: 該当のフォロワー
  def latest_followers
    return self.followers.where(id: self.reverses_of_follows.where(created_at: self.notified_at..Time.now).map(&:from_user))
  end

  # フォローしているユーザのidのリストを取得
  # @return: user_idのリスト
  scope :following_ids, -> {
    return user.followings.ids
  }
  
  # フォローできるか
  # @param target_user: 対象のユーザ
  # @return: フォロー可能ならtrue
  def can_follow?(target_user)
    # TODO: 相手にブロックされてるかどうかのチェックも入れるならここ
    return !target_user.is_disable_follow && (self != target_user)
  end
  
  # フォローしているか
  # @param target_user: 対象のユーザ
  # @return: フォローしていればtrue
  def following?(target_user)
    return self.followings.include?(target_user)
  end

  # フォローする
  # @param target_user: 対象のユーザ
  def follow(target_user)
    if can_follow?(target_user)
      self.follows.find_or_create_by(to_user: target_user)
    end
  end
  
  # フォローを外す
  # @param target_user: 対象のユーザ
  def unfollow(target_user)
    follow = self.follows.find_by(to_user: target_user)
    follow.destroy if follow
  end
  
  
  # 共感（投稿）しているか
  # @param target_edge: 参考にするエッジ、別のユーザが所有しているものでも可
  # @param from_node  : 始点ノード、エッジ指定があれば無視
  # @param to_node    : 終点ノード、エッジ指定があれば無視
  # @return: 共感（投稿）していればtrue
  def empathize?(target_edge: nil, from_node: nil, to_node: nil)
    param = node_param(
        target_edge: target_edge,
        from_node:   from_node,
        to_node:     to_node,
      )
    return !!self.edges.find_by(param)
  end
  
  # 共感（投稿）する
  # @param target_edge   : 参考にするエッジ、別のユーザが所有しているものでも可
  # @param from_node     : 始点ノード、エッジ指定があれば無視
  # @param to_node       : 終点ノード、エッジ指定があれば無視
  # @param is_hide_user  : 他のユーザからユーザ名を隠すか
  # @return: あれば該当のエッジ、なければnil
  def empathize(target_edge: nil, from_node: nil, to_node: nil, is_hide_user: false)
    param = node_param(
        target_edge: target_edge,
        from_node:   from_node,
        to_node:     to_node,
      )
      
    edge = self.edges.find_by(param)
    return edge if edge
    
    param[:is_hide_user] = is_hide_user
    return self.edges.create(param)
  end
  
  # 共感（投稿）を消す
  # @param target_edge: 参考にするエッジ、別のユーザが所有しているものでも可
  # @param from_node  : 始点ノード、エッジ指定があれば無視
  # @param to_node    : 終点ノード、エッジ指定があれば無視
  def unempathize(target_edge: nil, from_node: nil, to_node: nil)
    param = node_param(
        target_edge: target_edge,
        from_node:   from_node,
        to_node:     to_node,
      )
    edge = self.edges.find_by(param)
    edge.destroy if edge
  end
  
  private
  
  # 共感（投稿）の処理用引数のノードのハッシュを作成
  # @param target_edge: 参考にするのエッジ、別のユーザが所有しているものでも可
  # @param from_node  : 始点ノード、エッジ指定があれば無視
  # @param to_node    : 終点ノード、エッジ指定があれば無視
  # @return: パラメータのハッシュ
  def node_param(target_edge: nil, from_node: nil, to_node: nil)
    if target_edge
      return {
        from_node: target_edge.from_node,
        to_node:   target_edge.to_node,
      }
    else
      return {
        from_node: from_node,
        to_node: to_node,
      }
    end
  end

end
