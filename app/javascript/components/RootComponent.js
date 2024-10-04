import React, { useEffect, useState } from 'react';

const RootComponent = () => {
  const [buildings, setBuildings] = useState(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const fetchBuildings = async (page) => {
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

  return (
    <div>
      <h3>Building Listings</h3>
      <div>
        <p>Page: {currentPage}</p>
        <button disabled={currentPage <= 1} onClick={() => goToPage(currentPage-1)}>previous</button>
        <button disabled={buildings === undefined || buildings.length === 0} onClick={() => goToPage(currentPage+1)}>next</button>
      </div>
      <BuildingCards buildings={buildings}></BuildingCards>
    </div>
  );
};

const display_custom_field_name = (key) => {
  return key.charAt(0).toUpperCase() + key.replace(/_/g, ' ').slice(1);
};

const BuildingCards = ({ buildings }) => {
  if (buildings === undefined) {
    return <div style={{ padding: '8px', margin: '16px' }}>loading...</div>;
  }
  if (buildings.length === 0) {
    return <div style={{ padding: '8px', margin: '16px' }}>No buildings to display</div>;
  }
  return (
    <div>
      {buildings.map((building) => (
        <div key={building.id} style={{ border: '4px', borderColor: 'dark-grey', borderStyle: 'groove', borderRadius: '8px', padding: '8px', width: '50%', margin: '16px' }}>
          {Object.entries(building).map(([key, value]) => (
            <div key={key}>
              <p>{display_custom_field_name(key)}: {value}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default RootComponent;
