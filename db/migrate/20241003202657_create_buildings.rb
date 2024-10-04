class CreateBuildings < ActiveRecord::Migration[7.2]
  def change
    create_table :buildings do |t|
      t.text :address
      t.string :state_code
      t.string :zipcode
      t.references :client, foreign_key: true

      t.timestamps
    end
  end
end
