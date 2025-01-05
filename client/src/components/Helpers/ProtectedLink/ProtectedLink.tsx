'use client';

import React, { memo, useCallback } from 'react';
import { useRouter } from 'next/navigation'; 
import PropTypes from 'prop-types';
import { useAuth } from '../../../hooks/useAuth';

interface ProtectedLinkProps {
  to: string;
  children: React.ReactNode;
}

const ProtectedLink: React.FC<ProtectedLinkProps> = ({ to, children }) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      if (isAuthenticated) {
        router.push(to);
      } else {
        router.push('/login');
      }
    },
    [isAuthenticated, router, to]
  );

  return (
    <a href={to} onClick={handleClick}>
      {children}
    </a>
  );
};

ProtectedLink.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default memo(ProtectedLink);
