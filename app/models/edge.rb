class Edge < ApplicationRecord
  
  belongs_to :user
  validates :user_id, presence: true, uniqueness: { scope: [:from_node_id, :to_node_id] }

  belongs_to :from_node, class_name: 'Node'
  validates :from_node_id, presence: true, uniqueness: { scope: [:user_id, :to_node_id] }

  belongs_to :to_node, class_name: 'Node'
  validates :to_node_id, presence: true, uniqueness: { scope: [:user_id, :from_node_id] }
  
  #validates :is_hide_user

  
  # デフォルト値設定
  before_validation do
    self.is_hide_user = false if self.is_hide_user.nil?

    # validationを継続
    true
  end
  
  
  # 特定日時よりも新しい注視中のエッジを取得
  # @param user: 対象のユーザ
  # @return: 該当のエッジのリスト
  scope :latest_edges, ->(user) {
    where(from_node: user.gazes.pluck(&:node_id), created_at: user.notified_at..Time.now)
  }
  
  # 指定のノードを含むエッジを持つユーザを取得
  # @param from_node: 始点のノード
  # @param to_node: 終点のノード
  # @return: 該当のユーザのリスト
  scope :connected_users, ->(from_node, to_node) {
    where(from_node: from_node, to_node: to_node).map(&:user)
  }

  # 指定されたユーザが表示できるエッジを取得
  # @param user: 対象のユーザ
  # @return: 該当のエッジのリスト
  scope :viewable_edges, ->(user) {
    where(user_id: user.following_ids.push(user.id))
  }
  
  # 指定されたユーザが表示できるエッジのうちユニークな関連付けのものを取得
  # @param user: 対象のユーザ
  # @return: 始点のノードとエッジの配列のハッシュ{ ノード, [エッジ, ... ] }
  scope :viewable_uniq_edges, ->(user) {
    # fromとtoのセットがユニークなedgeの配列をfromでグループ化する
    viewable_edges(user).includes(:from_node, :to_node).uniq{ |edge| [edge.from_node, edge.to_node] }.group_by(&:from_node)
  }
  
  # ユーザが表示できるエッジが紐づいているノードと総数を取得
  # @param user: 対象のユーザ
  # @return: ノードと総数のハッシュ{ ノード, 数 }
  scope :viewable_node_counts, ->(user) {
    viewable_edges(user).group(:from_node).count(:from_node_id).merge(viewable_edges(user).group(:to_node).count(:to_node_id)) do |key, v0, v1|
      # キーが重複していた場合
      v0 + v1
    end
  }
  
end
