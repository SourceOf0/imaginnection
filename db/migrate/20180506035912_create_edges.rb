class CreateEdges < ActiveRecord::Migration[5.1]
  def change
    create_table :edges do |t|
      t.references :user, foreign_key: true
      t.references :from_node, foreign_key: { to_table: :nodes }
      t.references :to_node, foreign_key: { to_table: :nodes }
      t.boolean :is_hide_user

      t.timestamps
    end
  end
end
