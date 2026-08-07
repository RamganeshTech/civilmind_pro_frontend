import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchAuthSession } from '../api_services/auth_api/authApi';
import { logout, setAuthCredentials, setOrganization } from '../features/slices/authSlice';
import { useAuthData } from './useAuthData';



export const useAuthCheck = () => {
    const dispatch = useDispatch();
    const { currentRole } = useAuthData(); // Pulling role from Redux Slice
    const [isLoading, setIsLoading] = useState(true);
    const hasChecked = useRef(false);

    useEffect(() => {
        if (hasChecked.current) return;
        hasChecked.current = true;




        const verify = async () => {
            try {
                // console.log("1. Starting API call...");
                const response = await fetchAuthSession(currentRole);

                // console.log("2. API call successful. Response:", response);

                if (response.ok && response.data) {
                    const userData = response.data;
                    // console.log("3. Extracted userData:", userData);

                    const organizationIdString = typeof userData.organizationId === 'object'
                        ? userData.organizationId?._id
                        : userData.organizationId;

                    // console.log("4. Parsed schoolId:", schoolIdString);

                    // If it prints step 4 but fails here, there is a Redux slice mismatch
                    dispatch(setAuthCredentials({
                        _id: userData._id,
                        userName: userData.userName,
                        organizationId: organizationIdString || '',
                        role: userData.role,
                        profileImageUrl: userData?.profileImage?.url || null,
                        isPlatformAdmin: userData?.isPlatformAdmin || false,
                        organizationName: userData?.organizationId.name || null,
                        organizationUrl: userData?.organizationId.logo.url || null,
                        token: ""
                    }));

                    dispatch(setOrganization({
                        organizationId: userData?.organizationId?._id,
                        organizationName: userData?.organizationId?.name,
                        organizationUrl: userData.organizationId?.logo?.url
                    }))

                    // console.log("5. Redux state successfully dispatched!");
                }
            } catch (error: any) {
                // 🚩 THIS WILL TELL US EXACTLY WHAT WENT WRONG
                // console.error("❌ Auth verification failed at step:", error);
                dispatch(logout());
            } finally {
                setIsLoading(false);
            }
        };

        verify();
    }, [dispatch]); // currentRole excluded from deps to prevent re-triggering loop after dispatch

    return { isLoading };
};