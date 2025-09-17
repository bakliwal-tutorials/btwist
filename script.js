// BTwist - Email Management System with EmailJS Integration
class EmailTemplateEditor {
  constructor() {
    this.emailjsConfig = {};
    this.emailTags = [];
    this.firebaseInitialized = false;
    this.initializeFirebase();
    this.bindEvents();
    this.updatePreview();
    this.initDynamicTaglines();
  }

  // Initialize Firebase
  async initializeFirebase() {
    try {
      const firebaseConfig = {
        apiKey: "AIzaSyBnVHuR8sARkzPSyi_HklZw_GXBwT5gFTE",
        authDomain: "btwist.firebaseapp.com",
        databaseURL: "https://btwist-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "btwist",
        storageBucket: "btwist.firebasestorage.app",
        messagingSenderId: "197256046300",
        appId: "1:197256046300:web:965af98c79f2b82ef7b619",
        measurementId: "G-H634YQ94HS"
      };

      firebase.initializeApp(firebaseConfig);
      this.database = firebase.database();
      this.firebaseInitialized = true;

      await this.loadConfigFromFirebase();
      this.initializeEmailJS();

    } catch (error) {
      console.error("Firebase initialization failed:", error);
      this.showStatus("Failed to connect to configuration database.", "error");
    }
  }

  // Load configuration from Firebase
  async loadConfigFromFirebase() {
    try {
      const configRef = this.database.ref('emailjs-config');
      const snapshot = await configRef.once('value');
      const config = snapshot.val();

      if (config) {
        this.emailjsConfig = config;
        console.log("EmailJS configuration loaded from Firebase");
      } else {
        console.log("No configuration found in Firebase");
        this.showStatus("EmailJS configuration not found. Please set up configuration.", "error");
      }
    } catch (error) {
      console.error("Failed to load configuration from Firebase:", error);
      this.showStatus("Failed to load configuration from database.", "error");
    }
  }

  // Save configuration to Firebase
  async saveConfigToFirebase(config) {
    try {
      const configRef = this.database.ref('emailjs-config');
      await configRef.set(config);
      console.log("EmailJS configuration saved to Firebase");
      this.showStatus("Configuration saved successfully!", "success");
    } catch (error) {
      console.error("Failed to save configuration to Firebase:", error);
      this.showStatus("Failed to save configuration to database.", "error");
    }
  }

  // Initialize EmailJS with stored configuration
  initializeEmailJS() {
    if (!window.emailjs) {
      this.showStatus(
        "EmailJS SDK failed to load. Please check your internet connection and refresh the page.",
        "error",
      );
      this.loadEmailJSFallback();
      return false;
    }

    if (this.emailjsConfig.publicKey) {
      emailjs.init({ publicKey: this.emailjsConfig.publicKey });
      return true;
    }
    return false;
  }

  // Fallback method to load EmailJS if initial load failed
  loadEmailJSFallback() {
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    script.onload = () => {
      this.showStatus("EmailJS SDK loaded successfully!", "success");
      this.initializeEmailJS();
    };
    script.onerror = () => {
      this.showStatus(
        "Failed to load EmailJS from fallback CDN. Please check your internet connection.",
        "error",
      );
    };
    document.head.appendChild(script);
  }

  // Save configuration (now uses Firebase)
  async saveConfig(config) {
    this.emailjsConfig = config;
    await this.saveConfigToFirebase(config);
    this.initializeEmailJS();
  }

  // Bind all event listeners
  bindEvents() {
    // Form submission
    document.getElementById("emailForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.sendEmail();
    });

    // Preview update

    // Email input with tag functionality
    const emailInput = document.getElementById("recipientEmail");
    if (emailInput) {
      emailInput.addEventListener("input", (e) => {
        this.handleEmailInput(e);
      });
      emailInput.addEventListener("keydown", (e) => {
        this.handleEmailKeydown(e);
      });
    }

    // Auto-update preview when other form inputs change
    const inputs = [
      "senderName",
      "studentName",
      "testDate",
      "btestNumber",
      "batchName",
      "totalStudents",
      "totalExamMarks",
      "physicsMaxMarks",
      "chemistryMaxMarks",
      "mathsMaxMarks",
      "physicsMarks",
      "chemistryMarks",
      "mathsMarks",
      "physicsRankAll",
      "chemistryRankAll",
      "mathsRankAll",
      "overallRankAll",
      "physicsRankBatch",
      "chemistryRankBatch",
      "mathsRankBatch",
      "overallRankBatch",
      "omrLink",
      "responseLink",
      "analysisLink",
    ];

    inputs.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener("input", () => {
          // Validate marks fields against their max values
          if (
            id === "physicsMarks" ||
            id === "chemistryMarks" ||
            id === "mathsMarks"
          ) {
            this.validateMarksInput(id);
          }

          this.updatePreview();
          // Update max values for marks fields when max marks change
          if (id.includes("MaxMarks")) {
            this.updateMarksValidation();
          }
        });
      }
    });

    // Add initial validation setup
    this.updateMarksValidation();

    // Configuration modal events
    const closeModalBtn = document.getElementById("closeModalBtn");
    const saveConfigBtn = document.getElementById("saveConfigBtn");
    const saveToFirebaseBtn = document.getElementById("saveToFirebaseBtn");

    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", () => {
        this.closeConfigModal();
      });
    }

    if (saveConfigBtn) {
      saveConfigBtn.addEventListener("click", () => {
        this.saveConfiguration();
      });
    }

    if (saveToFirebaseBtn) {
      saveToFirebaseBtn.addEventListener("click", () => {
        this.saveConfigurationToFirebaseFromModal();
      });
    }
  }

  // Handle email input changes
  handleEmailInput(e) {
    const value = e.target.value;
    if (value.includes(",")) {
      const emails = value.split(",");
      const emailToAdd = emails[0].trim();

      if (emailToAdd && this.isValidEmail(emailToAdd)) {
        this.addEmailTag(emailToAdd);
        e.target.value = emails.slice(1).join(",").trim();
      } else if (emailToAdd) {
        // Invalid email, clear the input but don't add tag
        e.target.value = emails.slice(1).join(",").trim();
        this.showStatus(`Invalid email format: ${emailToAdd}`, "error");
      }
    }
  }

  // Handle keydown events for email input
  handleEmailKeydown(e) {
    const value = e.target.value.trim();

    // Add email on Enter or Tab key
    if ((e.key === "Enter" || e.key === "Tab") && value) {
      e.preventDefault();
      if (this.isValidEmail(value)) {
        this.addEmailTag(value);
        e.target.value = "";
      } else {
        this.showStatus(`Invalid email format: ${value}`, "error");
      }
    }

    // Handle backspace when input is empty - remove last tag
    if (e.key === "Backspace" && !value && this.emailTags.length > 0) {
      this.removeEmailTag(this.emailTags.length - 1);
    }
  }

  // Add email tag
  addEmailTag(email) {
    if (this.emailTags.length >= 2) {
      this.showStatus("Maximum 2 email addresses allowed.", "error");
      return;
    }

    if (this.emailTags.includes(email)) {
      this.showStatus("Email already added.", "error");
      return;
    }

    this.emailTags.push(email);
    this.renderEmailTags();
    this.updatePreview();
  }

  // Remove email tag
  removeEmailTag(index) {
    this.emailTags.splice(index, 1);
    this.renderEmailTags();
    this.updatePreview();
  }

  // Render email tags in UI
  renderEmailTags() {
    const tagsContainer = document.getElementById("emailTags");
    if (!tagsContainer) return;

    tagsContainer.innerHTML = "";

    this.emailTags.forEach((email, index) => {
      const tag = document.createElement("div");
      tag.className = "email-tag";

      const emailText = document.createElement("span");
      emailText.textContent = email;

      const removeBtn = document.createElement("div");
      removeBtn.className = "email-tag-remove";
      removeBtn.innerHTML = "×";
      removeBtn.addEventListener("click", () => {
        this.removeEmailTag(index);
      });

      tag.appendChild(emailText);
      tag.appendChild(removeBtn);
      tagsContainer.appendChild(tag);
    });
  }

  // Get all email addresses (from tags and current input)
  getAllEmails() {
    const currentInput = document.getElementById("recipientEmail").value.trim();
    const emails = [...this.emailTags];

    if (currentInput && this.isValidEmail(currentInput)) {
      emails.push(currentInput);
    }

    return emails.slice(0, 2); // Limit to 2 emails
  }

  // Parse multiple emails from input
  parseEmails(emailInput) {
    // Split by comma and clean up whitespace
    const emails = emailInput
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email.length > 0);
    // Limit to maximum 2 emails
    return emails.slice(0, 2);
  }

  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate multiple emails
  validateEmails(emails) {
    if (emails.length === 0) {
      return {
        valid: false,
        message: "Please enter at least one email address.",
      };
    }
    if (emails.length > 2) {
      return { valid: false, message: "Maximum 2 email addresses allowed." };
    }
    for (let email of emails) {
      if (!this.isValidEmail(email)) {
        return {
          valid: false,
          message: `Please enter a valid email address: ${email}`,
        };
      }
    }
    return { valid: true };
  }

  // Update marks field validation based on max marks
  updateMarksValidation() {
    const physicsMaxMarks =
      document.getElementById("physicsMaxMarks").value || 100;
    const chemistryMaxMarks =
      document.getElementById("chemistryMaxMarks").value || 100;
    const mathsMaxMarks = document.getElementById("mathsMaxMarks").value || 100;

    // Update max attributes and placeholders
    const physicsMarks = document.getElementById("physicsMarks");
    const chemistryMarks = document.getElementById("chemistryMarks");
    const mathsMarks = document.getElementById("mathsMarks");

    if (physicsMarks) {
      physicsMarks.setAttribute("max", physicsMaxMarks);
      physicsMarks.placeholder = `out of ${physicsMaxMarks}`;
    }
    if (chemistryMarks) {
      chemistryMarks.setAttribute("max", chemistryMaxMarks);
      chemistryMarks.placeholder = `out of ${chemistryMaxMarks}`;
    }
    if (mathsMarks) {
      mathsMarks.setAttribute("max", mathsMaxMarks);
      mathsMarks.placeholder = `out of ${mathsMaxMarks}`;
    }

    // Validate current values after updating max marks
    this.validateMarksInput("physicsMarks");
    this.validateMarksInput("chemistryMarks");
    this.validateMarksInput("mathsMarks");
  }

  // Validate individual marks input against its maximum value
  validateMarksInput(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field || !field.value) return;

    let maxMarksField;
    let subjectName;

    switch (fieldId) {
      case "physicsMarks":
        maxMarksField = document.getElementById("physicsMaxMarks");
        subjectName = "Physics";
        break;
      case "chemistryMarks":
        maxMarksField = document.getElementById("chemistryMaxMarks");
        subjectName = "Chemistry";
        break;
      case "mathsMarks":
        maxMarksField = document.getElementById("mathsMaxMarks");
        subjectName = "Maths";
        break;
      default:
        return;
    }

    const maxMarks = parseInt(maxMarksField.value) || 100;
    const currentMarks = parseInt(field.value);

    if (currentMarks > maxMarks) {
      field.value = maxMarks;
      this.showStatus(
        `${subjectName} marks cannot exceed ${maxMarks}. Value adjusted to ${maxMarks}.`,
        "error",
      );
    } else if (currentMarks < 0) {
      field.value = 0;
      this.showStatus(
        `${subjectName} marks cannot be negative. Value adjusted to 0.`,
        "error",
      );
    }
  }

  // Update email preview
  updatePreview() {
    const recipientEmails = this.getAllEmails();
    const recipientEmail =
      recipientEmails.length > 0
        ? recipientEmails.join(", ")
        : "student@example.com";
    const senderName = "Academics Bakliwal";

    // Get all form data
    const studentName =
      document.getElementById("studentName").value || "[Student Name]";
    const testDate = document.getElementById("testDate").value || "[Test Date]";
    const btestNumber =
      document.getElementById("btestNumber").value || "Btest-12";
    const batchName =
      document.getElementById("batchName").value || "[Batch Name]";
    const totalStudents =
      document.getElementById("totalStudents").value || "[Total Students]";

    // Exam configuration
    const totalExamMarks =
      document.getElementById("totalExamMarks").value || 300;
    const physicsMaxMarks =
      document.getElementById("physicsMaxMarks").value || 100;
    const chemistryMaxMarks =
      document.getElementById("chemistryMaxMarks").value || 100;
    const mathsMaxMarks = document.getElementById("mathsMaxMarks").value || 100;

    const physicsMarks =
      document.getElementById("physicsMarks").value || "[Physics Score]";
    const chemistryMarks =
      document.getElementById("chemistryMarks").value || "[Chemistry Score]";
    const mathsMarks =
      document.getElementById("mathsMarks").value || "[Maths Score]";

    const physicsRankAll =
      document.getElementById("physicsRankAll").value || "[Physics Rank]";
    const chemistryRankAll =
      document.getElementById("chemistryRankAll").value || "[Chemistry Rank]";
    const mathsRankAll =
      document.getElementById("mathsRankAll").value || "[Maths Rank]";
    const overallRankAll =
      document.getElementById("overallRankAll").value || "[Overall Rank]";

    const physicsRankBatch =
      document.getElementById("physicsRankBatch").value ||
      "[Physics Batch Rank]";
    const chemistryRankBatch =
      document.getElementById("chemistryRankBatch").value ||
      "[Chemistry Batch Rank]";
    const mathsRankBatch =
      document.getElementById("mathsRankBatch").value || "[Maths Batch Rank]";
    const overallRankBatch =
      document.getElementById("overallRankBatch").value ||
      "[Overall Batch Rank]";

    const omrLink =
      document.getElementById("omrLink").value || "[OMR Sheet Link]";
    const responseLink =
      document.getElementById("responseLink").value || "[Response Report Link]";
    const analysisLink =
      document.getElementById("analysisLink").value || "[Analysis Report Link]";

    // Calculate total marks
    const totalMarks =
      (parseInt(physicsMarks) || 0) +
      (parseInt(chemistryMarks) || 0) +
      (parseInt(mathsMarks) || 0);

    // Format test date
    const formattedDate = testDate
      ? new Date(testDate).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "[Test Date]";

    // Generate subject automatically
    const emailSubject = `Bakliwal Tutorials: result for Btest on ${formattedDate}`;
    document.getElementById("emailSubject").value = emailSubject;

    // Generate email body
    const emailBody = `
      <p><strong>Dear ${studentName},</strong></p>

      <br><p>Please find below the detailed result of <strong>${btestNumber}</strong> that was conducted in the offline mode on <strong>${formattedDate}</strong>.</p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background-color: #000000;">
          <th style="border: 1px solid #ddd; padding: 12px; text-align: left;"></th>
          <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold; color: #f9ab00;">Physics</th>
          <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold; color: #f9ab00;">Chemistry</th>
          <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold; color: #f9ab00;">Maths</th>
          <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold; color: #f9ab00;">Total</th>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold;">Marks Secured:</td>
          <td style="border: 1px solid #ddd; padding: 12px;">${physicsMarks} out of ${physicsMaxMarks}</td>
          <td style="border: 1px solid #ddd; padding: 12px;">${chemistryMarks} out of ${chemistryMaxMarks}</td>
          <td style="border: 1px solid #ddd; padding: 12px;">${mathsMarks} out of ${mathsMaxMarks}</td>
          <td style="border: 1px solid #ddd; padding: 12px;">${totalMarks} out of ${totalExamMarks}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold;">Rank among all offline students:</td>
          <td style="border: 1px solid #ddd; padding: 12px;">${physicsRankAll}</td>
          <td style="border: 1px solid #ddd; padding: 12px;">${chemistryRankAll}</td>
          <td style="border: 1px solid #ddd; padding: 12px;">${mathsRankAll}</td>
          <td style="border: 1px solid #ddd; padding: 12px;">${overallRankAll}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold;">Rank within current batch:</td>
          <td style="border: 1px solid #ddd; padding: 12px;">${physicsRankBatch}</td>
          <td style="border: 1px solid #ddd; padding: 12px;">${chemistryRankBatch}</td>
          <td style="border: 1px solid #ddd; padding: 12px;">${mathsRankBatch}</td>
          <td style="border: 1px solid #ddd; padding: 12px;">${overallRankBatch}</td>
        </tr>
      </table>


      <ul>
        <li><strong>"Rank among all Offline students" is your rank amongst all the students (${totalStudents}) who wrote this test in the Offline mode</strong></li>
        <li><strong>"Rank within current batch" is your rank amongst your classmates attending the batch - ${batchName}</strong></li>
        <li><strong>The marks of students whose ranks are beyond a particular number are in the similar range. Hence, we have treated them equally and given them their rank with '+' symbol.</strong></li>
      </ul>



      <br><p>You may download the scanned copy of your OMR sheet by clicking on the link: <a href="${omrLink}" target="_blank" style="font-weight: bold; color: blue;">${omrLink}</a></p>

      <p>You may download the student response report by clicking on the link: <a href="${responseLink}" target="_blank" style="font-weight: bold; color: blue;">${responseLink}</a></p>

      <p>You may download the student Analysis report by clicking on the link: <a href="${analysisLink}" target="_blank" style="font-weight: bold; color: blue;">${analysisLink}</a></p>

      <br><p>Regards,<br><strong>BT Team.</strong></p>
    `;

    document.getElementById("previewTo").textContent = recipientEmail;
    document.getElementById("previewFrom").textContent = senderName;
    document.getElementById("previewSubject").textContent = emailSubject;
    document.getElementById("previewBody").innerHTML = emailBody;
  }

  // Check if EmailJS configuration is needed
  checkConfiguration() {
    if (!this.emailjsConfig.serviceId || !this.emailjsConfig.templateId || !this.emailjsConfig.publicKey) {
      this.showConfigModal();
      return false;
    }
    return true;
  }

  // Show configuration modal
  showConfigModal() {
    const modal = document.getElementById("configModal");
    modal.classList.remove("hidden");

    // Pre-fill existing values
    document.getElementById("serviceId").value = this.emailjsConfig.serviceId || "";
    document.getElementById("templateId").value = this.emailjsConfig.templateId || "";
    document.getElementById("publicKey").value = this.emailjsConfig.publicKey || "";
  }

  // Close configuration modal
  closeConfigModal() {
    document.getElementById("configModal").classList.add("hidden");
  }

  // Save EmailJS configuration locally and to Firebase
  async saveConfiguration() {
    const serviceId = document.getElementById("serviceId").value.trim();
    const templateId = document.getElementById("templateId").value.trim();
    const publicKey = document.getElementById("publicKey").value.trim();

    if (!serviceId || !templateId || !publicKey) {
      this.showStatus("Please fill in all configuration fields.", "error");
      return;
    }

    await this.saveConfig({ serviceId, templateId, publicKey });
    this.closeConfigModal();
  }

  // Save current configuration directly to Firebase from the modal
  async saveConfigurationToFirebaseFromModal() {
    const serviceId = document.getElementById("serviceId").value.trim();
    const templateId = document.getElementById("templateId").value.trim();
    const publicKey = document.getElementById("publicKey").value.trim();

    if (!serviceId || !templateId || !publicKey) {
      this.showStatus("Please fill in all configuration fields.", "error");
      return;
    }

    // Update local config first
    this.emailjsConfig = { serviceId, templateId, publicKey };
    // Save to Firebase
    await this.saveConfigToFirebase(this.emailjsConfig);
    this.closeConfigModal();
  }

  // Send email using EmailJS
  async sendEmail() {
    // Check if EmailJS SDK is loaded
    if (!window.emailjs) {
      this.showStatus(
        "EmailJS SDK failed to load. Please refresh the page and try again.",
        "error",
      );
      return;
    }

    // Check if configuration is available
    if (!this.checkConfiguration()) {
      return;
    }

    // Get form data
    const recipientEmails = this.getAllEmails();
    const senderName = "Academics Bakliwal";
    const emailSubject = document.getElementById("emailSubject").value;

    // Generate email body from form data
    const emailBody = document.getElementById("previewBody").innerHTML;

    // Validate required fields
    if (recipientEmails.length === 0 || !emailSubject) {
      this.showStatus(
        "Please enter at least one email address and subject.",
        "error",
      );
      return;
    }

    // Validate email addresses
    const emailValidation = this.validateEmails(recipientEmails);
    if (!emailValidation.valid) {
      this.showStatus(emailValidation.message, "error");
      return;
    }

    // Clean and prepare the HTML content
    const cleanedHtmlBody = this.cleanHtmlForEmail(emailBody);

    try {
      // Show sending status
      this.showStatus(
        `Sending email to ${recipientEmails.length} recipient(s)...`,
        "info",
      );
      document.getElementById("sendBtn").disabled = true;

      // Send email to each recipient
      const emailPromises = recipientEmails.map(async (recipientEmail) => {
        // Prepare template parameters for each recipient
        const templateParams = {
          to_email: recipientEmail,
          to_name: recipientEmail.split("@")[0], // Extract name from email
          from_name: senderName,
          from_email: senderName,
          subject: emailSubject,
          message: this.stripHtml(emailBody), // Plain text version
          message_html: cleanedHtmlBody, // HTML version
          html_content: cleanedHtmlBody, // Alternative HTML field name
          content: cleanedHtmlBody, // Generic content field
          body: cleanedHtmlBody, // Another common field name
          reply_to: recipientEmail,
        };

        // Send email to this recipient
        return await emailjs.send(
          this.emailjsConfig.serviceId,
          this.emailjsConfig.templateId,
          templateParams,
        );
      });

      // Wait for all emails to be sent
      const responses = await Promise.all(emailPromises);

      console.log("All emails sent successfully:", responses);
      this.showStatus(
        `Email sent successfully to ${recipientEmails.length} recipient(s)!`,
        "success",
      );

      // Reset form after successful send
      this.resetForm();
    } catch (error) {
      console.error("Failed to send email:", error);

      let errorMessage = "Failed to send email. ";
      if (error.text) {
        errorMessage += error.text;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage +=
          "Please check your EmailJS configuration and try again.";
      }

      this.showStatus(errorMessage, "error");

      // If configuration error, show config modal
      if (error.text && error.text.includes("401")) {
        this.showConfigModal();
      }
    } finally {
      document.getElementById("sendBtn").disabled = false;
    }
  }

  // Strip HTML tags from text
  stripHtml(html) {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  }

  // Clean HTML for better email compatibility
  cleanHtmlForEmail(html) {
    // Create a temporary div to manipulate the HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // Ensure all style attributes are preserved and convert some CSS to inline styles
    const allElements = tempDiv.querySelectorAll("*");
    allElements.forEach((element) => {
      // Convert common formatting to inline styles for better email compatibility
      const computedStyle = window.getComputedStyle
        ? window.getComputedStyle(element)
        : null;

      if (
        element.style.fontWeight === "bold" ||
        element.tagName === "B" ||
        element.tagName === "STRONG"
      ) {
        element.style.fontWeight = "bold";
      }

      if (
        element.style.fontStyle === "italic" ||
        element.tagName === "I" ||
        element.tagName === "EM"
      ) {
        element.style.fontStyle = "italic";
      }

      if (
        element.style.textDecoration === "underline" ||
        element.tagName === "U"
      ) {
        element.style.textDecoration = "underline";
      }

      // Ensure color styles are preserved
      if (element.style.color) {
        element.style.color = element.style.color;
      }
    });

    return tempDiv.innerHTML;
  }

  // Reset form to default state
  resetForm() {
    // Clear email tags
    this.emailTags = [];
    this.renderEmailTags();

    // Clear form fields except sender name, subject, and exam configuration which have default values
    const fieldsToReset = [
      "recipientEmail",
      "studentName",
      "testDate",
      "batchName",
      "totalStudents",
      "physicsMarks",
      "chemistryMarks",
      "mathsMarks",
      "physicsRankAll",
      "chemistryRankAll",
      "mathsRankAll",
      "overallRankAll",
      "physicsRankBatch",
      "chemistryRankBatch",
      "mathsRankBatch",
      "overallRankBatch",
      "omrLink",
      "responseLink",
      "analysisLink",
    ];

    fieldsToReset.forEach((fieldId) => {
      const element = document.getElementById(fieldId);
      if (element) {
        element.value = "";
      }
    });

    this.updatePreview();
  }

  // Show status message
  showStatus(message, type) {
    const statusElement = document.getElementById("statusMessage");
    statusElement.textContent = message;
    statusElement.className = `status-message ${type}`;
    statusElement.classList.remove("hidden");

    // Auto-hide success and info messages after 5 seconds
    if (type === "success" || type === "info") {
      setTimeout(() => {
        statusElement.classList.add("hidden");
      }, 5000);
    }
  }

  // Initialize dynamic taglines rotation
  initDynamicTaglines() {
    const taglines = [
      "One mail to save your ass from dad's chappal.",
      "Why study when we can \"mail\" it?",
      "Failed in exam, topped in inbox.",
      "Your marks are temporary, Our mails are permanent",
      "Making every BTian a topper - at least in inbox.",
      "When your marks can't change, but your email can."
    ];

    let currentIndex = 0;
    const taglineElement = document.getElementById("dynamicTagline");

    const rotateTagline = () => {
      // Fade out current tagline
      taglineElement.classList.add("fade-out");

      setTimeout(() => {
        // Change the text and fade back in
        taglineElement.textContent = taglines[currentIndex];
        taglineElement.classList.remove("fade-out");
        currentIndex = (currentIndex + 1) % taglines.length;
      }, 250); // Half of the CSS transition time
    };

    // Start rotation after 3 seconds, then every 4 seconds
    setTimeout(() => {
      rotateTagline();
      setInterval(rotateTagline, 4000);
    }, 3000);

    // Check for admin panel access
    this.checkAdminAccess();
  }

  // Check for admin panel access (hidden feature)
  checkAdminAccess() {
    // Listen for admin access key combination (Ctrl+Shift+A)
    let adminKeySequence = [];
    const adminSequence = ['Control', 'Shift', 'KeyA'];
    
    document.addEventListener('keydown', (e) => {
      adminKeySequence.push(e.code);
      
      // Keep only the last 3 keys
      if (adminKeySequence.length > 3) {
        adminKeySequence.shift();
      }
      
      // Check if the sequence matches
      if (adminKeySequence.length === 3 && 
          adminSequence.every((key, index) => adminKeySequence[index] === key)) {
        
        if (confirm('🔒 Access Admin Panel?\n\nThis will redirect you to the configuration management interface.')) {
          window.location.href = 'admin.html';
        }
        adminKeySequence = []; // Reset sequence
      }
    });

    document.addEventListener('keyup', () => {
      // Reset sequence on key release to ensure proper combo detection
      setTimeout(() => {
        adminKeySequence = [];
      }, 1000);
    });
  }
}

// Initialize the email editor when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Wait a bit for external scripts to load
  setTimeout(() => {
    window.emailEditor = new EmailTemplateEditor();
  }, 100);

  // Add click outside modal to close
  document.getElementById("configModal").addEventListener("click", (e) => {
    if (e.target.id === "configModal") {
      window.emailEditor.closeConfigModal();
    }
  });
});

// Export for potential module use
if (typeof module !== "undefined" && module.exports) {
  module.exports = EmailTemplateEditor;
}