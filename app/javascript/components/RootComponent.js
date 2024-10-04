import React, { useEffect, useState } from 'react';

const RootComponent = () => {
  const [buildings, setBuildings] = useState(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const fetchBuildings = async (page) => {
    if (page === undefined) {
      page = currentPage;
    }
    const response = await fetch(`/buildings?page=${page}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const result = await response.json();
    if (result['status'] == "success") {
      setBuildings(result['buildings']);
    }
  }
  useEffect(() => {
    fetchBuildings(currentPage);
  }, []);

  const goToPage = (newPage) => {
    setCurrentPage(newPage);
    fetchBuildings(newPage);
  };

  const saveEditedBuilding = async (editedBuilding) => {
    const { id, ...buildingData } = editedBuilding;
    const response = await fetch(`/buildings/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ building: buildingData }),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const result = await response.json();
    if (result['status'] == "success") {
      fetchBuildings();
    }
  }

  return (
    <div>
      <h3>Building Listings</h3>
      <div>
        <p>Page: {currentPage}</p>
        <button disabled={currentPage <= 1} onClick={() => goToPage(currentPage-1)}>previous</button>
        <button disabled={buildings === undefined || buildings.length === 0} onClick={() => goToPage(currentPage+1)}>next</button>
      </div>
      <BuildingCards buildings={buildings} saveEditedBuilding={saveEditedBuilding}></BuildingCards>
    </div>
  );
};

const display_custom_field_name = (key) => {
  return key.charAt(0).toUpperCase() + key.replace(/_/g, ' ').slice(1);
};

const BuildingCards = ({ buildings, saveEditedBuilding }) => {
  if (buildings === undefined) {
    return <div style={{ padding: '8px', margin: '16px' }}>loading...</div>;
  }
  if (buildings.length === 0) {
    return <div style={{ padding: '8px', margin: '16px' }}>No buildings to display</div>;
  }
  return (
    <div>
      {buildings.map((building) => <BuildingCard key={building.id} building={building} saveEditedBuilding={saveEditedBuilding}></BuildingCard>)}
    </div>
  );
}

const BuildingCard = ({ building, saveEditedBuilding }) => {
  const [editing, setEditing] = useState(false);
  const [editedBuilding, setEditedBuilding] = useState(building);

  const handleInputChange = (key, value) => {
    setEditedBuilding((prevBuilding) => ({
      ...prevBuilding,
      [key]: value,
    }));
  };

  const onSave = () => {
    setEditing(false);
    saveEditedBuilding(editedBuilding);
  }

  if (!editing) {
    return (
      <div
        key={building.id}
        style={{
          border: '4px',
          borderColor: 'dark-grey',
          borderStyle: 'groove',
          borderRadius: '8px',
          padding: '8px',
          width: '50%',
          margin: '16px',
        }}
      >
        {Object.entries(building).map(([key, value]) => (
          <div key={key}>
            <p>
              {display_custom_field_name(key)}: {value}
            </p>
          </div>
        ))}
        <div key='edit_button'>
          <button onClick={() => setEditing(true)}>Edit</button>
        </div>
      </div>
    );
  } else {
    return (
      <div
        key={building.id}
        style={{
          border: '4px',
          borderColor: 'dark-grey',
          borderStyle: 'groove',
          borderRadius: '8px',
          padding: '8px',
          width: '50%',
          margin: '16px',
        }}
      >
        {Object.entries(editedBuilding).map(([key, value]) => {
          if (key === 'id' || key === 'client_name') {
            return (
              <div key={key}>
                <p>
                  {display_custom_field_name(key)}: {value}
                </p>
              </div>
            );
          }
          return (
            <div key={key}>
              <p>
                {display_custom_field_name(key)}:
                <input
                  type='text'
                  value={value}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                />
              </p>
            </div>
          )
        })}
        <div key='save_button'>
          <button onClick={() => onSave()}>Save</button>
        </div>
      </div>
    );
  }
};

export default RootComponent;
