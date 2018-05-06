class AddUniqToEdges < ActiveRecord::Migration[5.1]
  def change
    add_index :edges, [:user_id, :from_node_id, :to_node_id], unique: true
  end
end
