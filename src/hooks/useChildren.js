import { useEffect, useState } from 'react';
import { parentsApi } from '../api/resources';
import { useAuth } from '../context/AuthContext';

export function useChildren() {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.parentProfile) {
      setLoading(false);
      return;
    }
    parentsApi.getOne(user.parentProfile).then((r) => {
      setChildren(r.data.children || []);
      if (r.data.children?.length) setSelectedId(r.data.children[0]._id);
    }).finally(() => setLoading(false));
  }, [user?.parentProfile]);

  const selected = children.find((c) => c._id === selectedId) || null;

  return { children, selectedId, setSelectedId, selected, loading };
}
