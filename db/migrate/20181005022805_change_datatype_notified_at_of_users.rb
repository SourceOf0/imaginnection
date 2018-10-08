class ChangeDatatypeNotifiedAtOfUsers < ActiveRecord::Migration[5.1]
  def change
    change_column :users, :notified_at, :datetime
  end
end
