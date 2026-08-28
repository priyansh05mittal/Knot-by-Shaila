import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';

const Profile = () => {
  const { user, updateUserInPlace, refetchUser } = useAuth();
  const [profileForm, setProfileForm] = useState({ fullName: user?.fullName || '', contactNumber: user?.contactNumber || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef();

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { user: updated } = await userService.updateProfile(profileForm);
      updateUserInPlace(updated);
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    setSavingPassword(true);
    try {
      await userService.changePassword(passwordForm);
      toast.success('Password changed successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const { avatar } = await userService.updateAvatar(formData);
      updateUserInPlace({ avatar });
      await refetchUser();
      toast.success('Avatar updated.');
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not upload avatar.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="card-cozy p-6">
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-rose/15 flex items-center justify-center font-display text-2xl text-rose-dark overflow-hidden">
              {user?.avatar?.url ? (
                <img src={user.avatar.url} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                user?.fullName?.charAt(0)
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-rose text-white flex items-center justify-center shadow-soft"
            >
              <Camera size={13} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
          </div>
          <div>
            <h2 className="font-label font-semibold text-lg text-brown-deep">Profile Photo</h2>
            <p className="text-sm text-brown-light">{uploadingAvatar ? 'Uploading…' : 'PNG or JPG, up to 5MB'}</p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-label text-brown-deep mb-1.5 block">Full Name</label>
            <input value={profileForm.fullName} onChange={(e) => setProfileForm((f) => ({ ...f, fullName: e.target.value }))} className="input-cozy" />
          </div>
          <div>
            <label className="text-sm font-label text-brown-deep mb-1.5 block">Contact Number</label>
            <input value={profileForm.contactNumber} onChange={(e) => setProfileForm((f) => ({ ...f, contactNumber: e.target.value }))} className="input-cozy" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-label text-brown-deep mb-1.5 block">Email</label>
            <input disabled value={user?.email} className="input-cozy opacity-60 cursor-not-allowed" />
          </div>
          <button type="submit" disabled={savingProfile} className="btn-primary sm:col-span-2 justify-center disabled:opacity-50">
            {savingProfile ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="card-cozy p-6">
        <h2 className="font-label font-semibold text-lg text-brown-deep mb-4">Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
          <input required type="password" placeholder="Current Password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))} className="input-cozy" />
          <input required type="password" placeholder="New Password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))} className="input-cozy" />
          <input required type="password" placeholder="Confirm New Password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))} className="input-cozy" />
          <button type="submit" disabled={savingPassword} className="btn-outline disabled:opacity-50">
            {savingPassword ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
