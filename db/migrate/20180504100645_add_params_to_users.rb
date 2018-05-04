class AddParamsToUsers < ActiveRecord::Migration[5.1]
  def change
    add_column :users, :name, :string
    add_column :users, :is_enable_follow, :boolean
    add_column :users, :empathy_button_kind, :integer
    add_column :users, :notified_at, :date
  end
end
