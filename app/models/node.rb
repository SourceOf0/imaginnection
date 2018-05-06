class Node < ApplicationRecord
  
  validates :name, presence: true, length: { maximum: 50 }
  
  has_many :users

  # edgesを経由してto_nodeを取得するto_nodesを定義
  has_many :edges, class_name: 'Edge', foreign_key: 'from_node'
  has_many :to_nodes, through: :edges, source: :to_node
  
  # edgesを経由してfrom_nodeを取得するfrom_nodesを定義
  has_many :reverses_of_edges, class_name: 'Edge', foreign_key: 'to_node'
  has_many :from_nodes, through: :reverses_of_edges, source: :from_node

end
