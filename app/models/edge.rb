class Edge < ApplicationRecord
  
  belongs_to :user, presence: true
  belongs_to :from_node, presence: true, class_name: 'Node'
  belongs_to :to_node, presence: true, class_name: 'Node'
  
end
