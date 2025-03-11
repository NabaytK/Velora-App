import ProfileSettings from '@/components/settings/ProfileSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import SubscriptionSettings from '@/components/settings/SubscriptionSettings';

export default function Settings() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
      
      <div className="overflow-hidden bg-white rounded-lg shadow">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Profile</h2>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <ProfileSettings />
        </div>
      </div>
      
      <div className="overflow-hidden bg-white rounded-lg shadow">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Notifications</h2>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <NotificationSettings />
        </div>
      </div>
      
      <div className="overflow-hidden bg-white rounded-lg shadow">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Subscription</h2>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <SubscriptionSettings />
        </div>
      </div>
      
      <div className="overflow-hidden bg-white rounded-lg shadow">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Delete Account</h2>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <p className="text-sm text-gray-500">
            Once you delete your account, all of your data will be permanently removed. This action cannot be undone.
          </p>
          <div className="mt-5">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
