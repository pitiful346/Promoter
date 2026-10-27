import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebaseConfig";

export class FirebaseStorageService {
  async uploadEventPoster(eventId: string, file: File): Promise<string> {
    const fileExtension = file.name.split(".").pop() || "jpg";
    const storageRef = ref(storage, `events/${eventId}/poster_${Date.now()}.${fileExtension}`);
    
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
    });
    
    return await getDownloadURL(snapshot.ref);
  }

  async uploadOrgLogo(orgId: string, file: File): Promise<string> {
    const fileExtension = file.name.split(".").pop() || "png";
    const storageRef = ref(storage, `organizations/${orgId}/logo_${Date.now()}.${fileExtension}`);
    
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
    });
    
    return await getDownloadURL(snapshot.ref);
  }
}

export const firebaseStorageService = new FirebaseStorageService();
