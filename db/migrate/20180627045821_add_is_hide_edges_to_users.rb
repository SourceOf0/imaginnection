class AddIsHideEdgesToUsers < ActiveRecord::Migration[5.1]
  def change
    add_column :users, :is_hide_edges, :boolean
  end
end
