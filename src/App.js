import React, { useEffect, useState } from "react";
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonInput,
  IonItem,
  IonIcon,
  IonModal,
  IonGrid,
  IonRow,
  IonCol,
  IonDatetime,
  IonSpinner,
  IonLabel,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonText,
} from "@ionic/react";
import { time } from "ionicons/icons";
import "./App.css";

import { firestore, serverTimestamp } from "./utils/firebase";

function App() {
  // if using auth
  // const [user] = useAuthState(auth);
  return (
    <div className="container">
      <header className="title">🛠️ Ladder Message Board</header>
      <section>
        <div className="all-chats">{<MessageBoard />}</div>
      </section>
    </div>
  );
}
/**
 * MESSAGE BOARD ELEMENT
 */
function MessageBoard() {
  let dateObj = new Date();
  let month = dateObj.getMonth() + 1; //months from 1-12
  month = `0${month}`.slice(-2);
  let day = dateObj.getDate();
  let year = dateObj.getFullYear();
  let hours = dateObj.getHours();
  // let minutes = dateObj.getMinutes();
  // let amPm = hours >= 12 ? "pm" : "am";
  let chosenTime = new Date(`${month}/${day}/2020 ${hours}:00`);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    `2021-${month}-${day} ${hours}:00`
  );
  // reference the messages
  const docLimit = 10;
  const messagesRef = firestore.collection("messages");
  // messages array
  const [messages, setMessages] = useState([]);
  const [lastDocs, setLastDocs] = useState();
  const [loading, setLoading] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  // form value
  const [formValue, setFormValue] = useState("");
  /**
   * HANDLE POSTING MESSAGES FROM LOCAL STORAGE
   */
  setInterval(function () {
    // if there is existing timeData
    if (localStorage.getItem("timeData") !== null) {
      // get the current time
      let currTimeCompare = `${month}/${day}/${year} ${hours}:00`;
      let timeData = JSON.parse(localStorage.getItem("timeData"));
      for (let i = 0; i < timeData.length; i++) {
        // if we need to post this message (CHANGE THIS!!!)
        if (currTimeCompare > timeData[i].chosenTime) {
          console.log("The time has come...");
          messagesRef.add({
            text: timeData[i].formValue,
            timestamp: serverTimestamp,
          });
          // also render most recent message if this happens
          getMostRecentMessage();
          // it was posted so remove it
          timeData.splice(i, 1);
        }
      }
      // set new timeData array
      // see if newTimeData is empty
      if (timeData.length === 0) {
        localStorage.clear("timeData");
      } else {
        localStorage.setItem("timeData", JSON.stringify(timeData));
      }
    }
    // currently checks every 60k ms but can be fine-tuned some more
  }, 600000);
  /**
   * MODAL/SCHEDULE POST
   */
  const modalClose = () => {
    setShowModal(false);
    // set the current and the
    // let currentTime = new Date(`${month}/${day}/${year} ${hours}:00`);
    chosenTime = new Date(
      `${selectedDate.slice(5, 7)}/${selectedDate.slice(
        8,
        10
      )}/${selectedDate.slice(0, 4)} ${selectedDate.slice(11, 13)}:00`
    );
  };
  /**
   * GET FIRST BATCH OF MESSAGES
   */
  useEffect(() => {
    setLoading(true);
    messagesRef
      .orderBy("timestamp", "desc")
      .limit(docLimit)
      .get()
      .then((collections) => {
        updateMessageState(collections);
        setLoading(false);
      });
  }, []);
  /**
   * HANDLE UPDATING LIST OF MESSAGES
   * @param {*} collections
   */
  const updateMessageState = (collections) => {
    // false if the collection is empty
    const isCollectionEmpty = collections.size === 0;
    if (!isCollectionEmpty) {
      const messages = collections.docs.map((message) => message.data());
      const lastDoc = collections.docs[collections.docs.length - 1];
      setMessages((msgs) => [...msgs, ...messages]);
      setLastDocs(lastDoc);
      setLoading(false);
    } else {
      // collection is empty, make a
      setIsEmpty(true);
    }
  };
  /**
   * HANDLE GETTING NEXT SET OF MESSAGES
   */
  const getMoreMessageDocs = () => {
    setLoading(true);
    messagesRef
      .orderBy("timestamp", "desc")
      .startAfter(lastDocs)
      .limit(docLimit)
      .get()
      .then((collections) => {
        updateMessageState(collections);
      });
  };
  /**
   * HANDLE GETTING MOST RECENT MESSAGE
   */
  const getMostRecentMessage = () => {
    messagesRef
      .orderBy("timestamp", "desc")
      .limit(1)
      .get()
      .then((collections) => {
        const message = [];
        collections.forEach((doc) => {
          message.push({ ...doc.data(), id: doc.id });
        });
        setMessages((msgs) => [...message, ...msgs]);
      });
  };
  /**
   * HANDLE POSTING MESSAGE
   * @param {*} event
   */
  const sendMessage = async (event) => {
    event.preventDefault();
    // get current time
    let currentTime = new Date(`${month}/${day}/${year} ${hours}:00`);
    // if the current time is greater to the proposed time, post the message right away
    if (currentTime > chosenTime) {
      console.log("Post message!\n");
      await messagesRef.add({
        text: formValue,
        timestamp: serverTimestamp,
      });
      getMostRecentMessage();
      setFormValue("");
      chosenTime = `${month}/${day}/${year} ${hours}:00`;
    } else {
      /**
       * if we are in here, the message needs to be saved in localStorage for later
       * it is checked by the handleAsyncPosts function which goes off every minute
       * only goes off if a time has been chosen in the modal (error check)
       * check if timeData exists, and if it does not, set it
       */
      if (localStorage.getItem("timeData") === null) {
        localStorage.clear("timeData");
        localStorage.setItem(
          "timeData",
          JSON.stringify([{ formValue: formValue, chosenTime: chosenTime }])
        );
        // append to the timeData array, as it exists
      } else {
        let timeData = JSON.parse(localStorage.getItem("timeData"));
        timeData.push({ formValue: formValue, chosenTime: chosenTime });
        localStorage.setItem("timeData", JSON.stringify(timeData));
      }
      setFormValue("");
    }
  };
  /**
   * RENDER CONTENT
   */
  return (
    <>
      <IonCard className="cardContainer" mode="ios">
        <IonCardContent>
          <form onSubmit={sendMessage}>
            <IonItem lines="none">
              <IonInput
                value={formValue}
                placeholder="Enter a new message"
                onIonChange={(event) => {
                  setFormValue(event.target.value);
                }}
              ></IonInput>
              <IonButton
                className="submitButton"
                type="submit"
                mode="ios"
                disabled={formValue ? false : true}
              >
                Send
              </IonButton>
              <IonButton
                className="submitButtonLater"
                type="button"
                mode="ios"
                disabled={formValue ? false : true}
                onClick={() => setShowModal(true)}
              >
                <IonIcon icon={time}></IonIcon>
              </IonButton>
            </IonItem>
          </form>
        </IonCardContent>
      </IonCard>
      <IonModal
        isOpen={showModal}
        backdropDismiss={true}
        onDidDismiss={(data) => modalClose(data)}
      >
        <IonHeader mode="ios">
          <IonToolbar color="white">
            <IonTitle>Select a time to post message</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowModal(false)}>
                <IonIcon name="close" slot="icon-only"></IonIcon>
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonItem mode="ios" lines="none">
          <IonLabel>YYYY-MM-DD, Hour</IonLabel>
          <IonDatetime
            mode="ios"
            displayFormat="YYYY-MM-DD, hh a"
            min={`2021`}
            max={`2030-01-01T12:00`}
            value={selectedDate}
            onIonChange={(e) => setSelectedDate(e.detail.value)}
          ></IonDatetime>
        </IonItem>
        <IonGrid>
          <IonRow>
            <IonCol className="centerButton">
              <IonButton
                onClick={() => setShowModal(false)}
                mode="ios"
                className="closeModal"
                onSubmit={sendMessage}
              >
                Close Modal
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonModal>
      <div>
        {messages &&
          messages.map((msg, index) => (
            <MessageBoardMessage key={index} message={msg} />
          ))}
      </div>
      <div>{loading && <IonSpinner name="dots"></IonSpinner>}</div>
      <div>{isEmpty && <IonText>No more messages</IonText>}</div>
      <div>
        {!loading && !isEmpty && (
          <IonItem>
            <IonButton
              className="loadMoreButton"
              mode="ios"
              onClick={getMoreMessageDocs}
            >
              <IonText>Load More</IonText>
            </IonButton>
          </IonItem>
        )}
      </div>
    </>
  );
}
/**
 * MESSAGE ELEMENT
 * @param {*} props
 */
function MessageBoardMessage(props) {
  const { text } = props.message;
  return (
    <IonCard className="cardContainer" mode="ios">
      <IonCardContent className="messageText">{text}</IonCardContent>
    </IonCard>
  );
}

export default App;
