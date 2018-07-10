class RenameIsEnableFollowColumnToUsers < ActiveRecord::Migration[5.1]
  def change
    rename_column :users, :is_enable_follow, :is_disable_follow
  end
end
