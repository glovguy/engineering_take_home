class BuildingsController < ApplicationController
  before_action :set_building, only: %i[ show edit update destroy ]

  def index
    # in a real app I would likely use a pagination gem
    page = params[:page].to_i || 1
    per_page = 10
    @buildings = Building.offset((page - 1) * per_page).limit(per_page)
    respond_to do |format|
      format.json do
        buildings_hashes = @buildings.map do |building|
          cfvs = building.custom_field_values
          cf_hash = {}
          cfvs.each { |cfv| cf_hash[cfv.custom_field.name] = cfv.value }
          {
            id: building.id,
            client_name: building.client.name,
            address: building.address,
            **cf_hash
          }
        end
        render json: { status: :success, buildings: buildings_hashes }
      end
      format.html 
    end
  end

  # GET /buildings/1 or /buildings/1.json
  def show
  end

  # GET /buildings/new
  def new
    @building = Building.new
  end

  # GET /buildings/1/edit
  def edit
  end

  # POST /buildings or /buildings.json
  def create
    @building = Building.new(building_params)

    respond_to do |format|
      if @building.save
        format.html { redirect_to @building, notice: "Building was successfully created." }
        format.json { render :show, status: :created, location: @building }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @building.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /buildings/1 or /buildings/1.json
  def update
    respond_to do |format|
      if @building.update(building_params)
        format.html { redirect_to @building, notice: "Building was successfully updated." }
        format.json { render :show, status: :ok, location: @building }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @building.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /buildings/1 or /buildings/1.json
  def destroy
    @building.destroy!

    respond_to do |format|
      format.html { redirect_to buildings_path, status: :see_other, notice: "Building was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_building
      @building = Building.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def building_params
      params.require(:building).permit(:address, :state_code, :zipcode)
    end
end
