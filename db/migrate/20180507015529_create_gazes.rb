class CreateGazes < ActiveRecord::Migration[5.1]
  def change
    create_table :gazes do |t|
      t.references :user, foreign_key: true
      t.references :node, foreign_key: true

      t.timestamps
      
      t.index [:user_id, :node_id], unique: true
    end
  end
end
