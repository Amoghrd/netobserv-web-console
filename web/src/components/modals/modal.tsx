import { Modal, ModalBody, ModalFooter, ModalHeader, ModalVariant } from '@patternfly/react-core';
import React from 'react';

// TODO: Remove this workaround when @patternfly/react-drag-drop >= 6.5.0 is available,
// which adds an `appendTo` prop on DragDropSort/DragDropContainer.
// See https://github.com/patternfly/patternfly-react/issues/11566
export function ensureRootElement() {
  if (!document.getElementById('root')) {
    const el = document.createElement('div');
    el.id = 'root';
    (document.getElementById('app') || document.body).appendChild(el);
  }
}

export interface CustomModalProps {
  children?: React.ReactNode;
  title: string;
  description?: JSX.Element;
  footer?: JSX.Element;
  onClose?: () => void;
  isOpen: boolean;
  scrollable?: boolean;
  id?: string;
}

const CustomModal: React.FC<CustomModalProps> = ({
  id,
  scrollable = true,
  isOpen,
  onClose,
  title,
  description,
  children,
  footer
}) => {
  return (
    <Modal
      id={id}
      data-test={id || 'modal'}
      variant={ModalVariant.small}
      isOpen={isOpen}
      onClose={onClose}
      appendTo={() => document.body}
    >
      <ModalHeader title={title} description={description} />
      <ModalBody
        style={scrollable ? { maxHeight: '50vh', overflow: 'auto' } : undefined}
        tabIndex={scrollable ? 0 : undefined}
      >
        {children}
      </ModalBody>
      {footer && <ModalFooter>{footer}</ModalFooter>}
    </Modal>
  );
};

export default CustomModal;
