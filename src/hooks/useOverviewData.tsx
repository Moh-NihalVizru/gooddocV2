import { useState, useEffect, useCallback, useRef } from 'react';
import { postToWorkflow } from '@/services/apiService';
import { authService } from '@/services/authService';
import { OverviewApiResponse, OverviewDataResponse } from '@/types/overview';
import { toast } from 'sonner';

interface UseOverviewDataReturn {
  data: OverviewDataResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useOverviewData(workflowId: string): UseOverviewDataReturn {
  const [data, setData] = useState<OverviewDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // Don't proceed if component is unmounted
    if (!isMountedRef.current) return;

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get current user from auth service
      const currentUser = authService.getCurrentUser();
      const userEmail = currentUser?.email || '';
      const userId = currentUser?.id?.toString() || '';

      if (!userEmail || !userId) {
        throw new Error('User not authenticated');
      }

      const payload = {
        email: userEmail,
        userId,
        action: 'getOverviewData',
        date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
      };

      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Set timeout for request
      const timeoutId = setTimeout(() => {
        if (controller) {
          controller.abort();
        }
      }, 15000);

      const { data: responseData, error: apiError } = await postToWorkflow<OverviewApiResponse>(
        workflowId,
        payload,
        controller.signal
      );

      clearTimeout(timeoutId);
      abortControllerRef.current = null;

      if (!isMountedRef.current) return;

      if (apiError) {
        if (apiError === 'Request cancelled') return;
        if (apiError.includes('Authentication')) {
          setError('Authentication required. Please login again.');
          return;
        }
        console.error('API error:', apiError);
        setError(apiError);
        
        if (apiError.includes('403')) {
          toast.error('Access Denied', {
            description: 'You do not have permission to view this data.',
            duration: 3000,
          });
          return;
        }
        
        if (!apiError.includes('abort') && !apiError.includes('cancelled')) {
          throw new Error(apiError);
        }
        return;
      }

      if (!responseData) {
        setData(null);
        return;
      }

      // Process the response data
      // The API returns an array-like object with numeric keys
      const processedData: OverviewDataResponse = {};
      
      // Extract data from the response (assuming first element contains the data)
      const firstKey = Object.keys(responseData)[0];
      if (firstKey && responseData[parseInt(firstKey)]) {
        Object.assign(processedData, responseData[parseInt(firstKey)]);
      }

      if (isMountedRef.current) {
        setData(processedData);
        setError(null);
      }
    } catch (err: any) {
      if (!isMountedRef.current) return;
      
      if (
        err.name === 'AbortError' ||
        err.message?.includes('abort') ||
        err.message?.includes('cancelled')
      ) {
        return;
      }

      console.error('Error fetching overview data:', err);
      const errorMessage = err.message || 'Failed to fetch overview data. Please try again.';
      setError(errorMessage);
      
      toast.error('Error', {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [workflowId]);

  // Fetch data on mount
  useEffect(() => {
    isMountedRef.current = true;
    fetchData();

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}
