class Relationship < ApplicationRecord
  
  validates :type, presence: true
  
  belongs_to :from_user, class_name: 'User'
  validates :from_user_id, presence: true, uniqueness: { scope: [:to_user_id] }
  
  belongs_to :to_user, class_name: 'User'
  validates :to_user_id, presence: true, uniqueness: { scope: [:from_user_id] }
  
end
