import { useState } from 'react';

const useRemoveModal = () => {
  const [removeModalActive, setRemoveModalActive] = useState(false);

  const openModalHandler = () => {
    setRemoveModalActive(true);
  };

  const closeModalHandler = () => {
    setRemoveModalActive(false);
  };

  return { removeModalActive, openModalHandler, closeModalHandler };
};

export default useRemoveModal;
