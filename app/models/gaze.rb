class Gaze < ApplicationRecord

  belongs_to :user
  validates :user_id, presence: true, uniqueness: { scope: [:node_id] }

  belongs_to :node
  validates :node_id, presence: true, uniqueness: { scope: [:user_id] }
  
end
