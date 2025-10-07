from flask import Flask, request, send_file, render_template, jsonify
from flask_cors import CORS
from PyPDF2 import PdfReader, PdfWriter
from pdf2docx import Converter
from PIL import Image
import io
import os
import zipfile
import uuid
import mysql.connector
from datetime import datetime
from werkzeug.utils import secure_filename
import tempfile
import fitz  # PyMuPDF for advanced PDF compression

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# MySQL Database Configuration
DB_CONFIG = {
    'host': '192.168.24.28',
    'user': 'root',
    'password': 'getplacebefore@2025',
    'database': 'pdfnest_db',
    'auth_plugin': 'mysql_native_password'
}

# Session Management
active_sessions = {}
MAX_SESSIONS = 100

def create_session():
    session_id = str(uuid.uuid4())
    if len(active_sessions) >= MAX_SESSIONS:
        cleanup_old_sessions()
    active_sessions[session_id] = {
        'current_operation': None,
        'uploaded_files': {},
        'created_at': datetime.now(),
        'last_activity': datetime.now(),
        'status': 'active'
    }
    return session_id

def cleanup_old_sessions():
    current_time = datetime.now()
    expired_sessions = []
    for session_id, session_data in active_sessions.items():
        time_diff = (current_time - session_data['last_activity']).total_seconds()
        if time_diff > 1800:
            expired_sessions.append(session_id)
    for session_id in expired_sessions:
        clear_session_files(session_id)
        del active_sessions[session_id]

def clear_session_files(session_id):
    if session_id in active_sessions:
        active_sessions[session_id]['uploaded_files'] = {}
        active_sessions[session_id]['current_operation'] = None

def update_session_activity(session_id):
    if session_id in active_sessions:
        active_sessions[session_id]['last_activity'] = datetime.now()

def validate_session(session_id, operation=None):
    if session_id not in active_sessions:
        return False, "Invalid session"
    update_session_activity(session_id)
    current_op = active_sessions[session_id]['current_operation']
    if current_op and operation and current_op != operation:
        return False, f"Another operation ({current_op}) is in progress"
    return True, "OK"

# Database Functions
def get_db_connection():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except mysql.connector.Error as err:
        print(f"Database connection error: {err}")
        return None

def init_database():
    try:
        conn = mysql.connector.connect(
            host=DB_CONFIG['host'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            auth_plugin='mysql_native_password'
        )
        cursor = conn.cursor()
        
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_CONFIG['database']}")
        cursor.execute(f"USE {DB_CONFIG['database']}")
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                user_id VARCHAR(50) PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                location VARCHAR(255) NOT NULL,
                user_type VARCHAR(50) NOT NULL,
                age_group VARCHAR(20) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_created_at (created_at)
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_operations (
                operation_id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(50) NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                feature_used VARCHAR(50) NOT NULL,
                rating INT NOT NULL,
                feedback TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id),
                INDEX idx_timestamp (timestamp),
                INDEX idx_feature (feature_used)
            )
        """)
        
        conn.commit()
        cursor.close()
        conn.close()
        print("✅ Database initialized successfully")
        
    except mysql.connector.Error as err:
        print(f"❌ Database initialization error: {err}")

def generate_user_id(email):
    try:
        conn = get_db_connection()
        if not conn:
            return None
        cursor = conn.cursor()
        cursor.execute("SELECT user_id FROM users WHERE email = %s", (email,))
        existing_user = cursor.fetchone()
        if existing_user:
            cursor.close()
            conn.close()
            return existing_user[0]
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        user_id = f"user_{user_count + 1:03d}"
        cursor.close()
        conn.close()
        return user_id
    except mysql.connector.Error as err:
        print(f"User ID generation error: {err}")
        return None

def save_user_data(data):
    try:
        conn = get_db_connection()
        if not conn:
            return False
        cursor = conn.cursor()
        
        user_id = generate_user_id(data.get('email'))
        if not user_id:
            return False
        
        cursor.execute("SELECT user_id FROM users WHERE email = %s", (data.get('email'),))
        existing_user = cursor.fetchone()
        
        if not existing_user:
            cursor.execute("""
                INSERT INTO users (user_id, email, name, location, user_type, age_group)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                user_id,
                data.get('email'),
                data.get('name'),
                data.get('location'),
                data.get('user_type'),
                data.get('age_group')
            ))
        
        cursor.execute("""
            INSERT INTO user_operations (operation_id, user_id, feature_used, rating, feedback)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            str(uuid.uuid4()),
            user_id,
            data.get('feature_used'),
            int(data.get('rating', 0)),
            data.get('feedback', '')
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        print(f"✅ User data saved: {data.get('name')} - {data.get('feature_used')}")
        return True
    except mysql.connector.Error as err:
        print(f"❌ Database save error: {err}")
        return False

init_database()


from flask import send_from_directory

@app.route('/sitemap.xml')
def sitemap():
    return send_from_directory('.', 'sitemap.xml')

@app.route('/robots.txt')
def robots():
    return send_from_directory('.', 'robots.txt')

# Routes - Home and Individual Pages
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/merge-pdf')
def merge_pdf_page():
    return render_template('merge-pdf.html')

@app.route('/split-pdf')
def split_pdf_page():
    return render_template('split-pdf.html')

@app.route('/delete-pdf-pages')
def delete_pdf_pages_page():
    return render_template('delete-pdf-pages.html')

@app.route('/reorder-pdf-pages')
def reorder_pdf_pages_page():
    return render_template('reorder-pdf-pages.html')

@app.route('/compress-pdf')
def compress_pdf_page():
    return render_template('compress-pdf.html')

@app.route('/convert-pdf')
def convert_pdf_page():
    return render_template('convert-pdf.html')

# API Routes
@app.route('/api/create_session', methods=['POST'])
def create_new_session():
    session_id = create_session()
    return jsonify({'session_id': session_id, 'status': 'success'})

@app.route('/api/clear_session', methods=['POST'])
def clear_session():
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        if session_id in active_sessions:
            clear_session_files(session_id)
            return jsonify({'status': 'success', 'message': 'Session cleared'})
        else:
            return jsonify({'status': 'error', 'message': 'Invalid session'}), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/save_user_data', methods=['POST'])
def save_user_data_route():
    try:
        data = request.get_json()
        required_fields = ['name', 'email', 'location', 'user_type', 'age_group', 'rating', 'feedback', 'feature_used']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'status': 'error', 'message': f'Missing required field: {field}'}), 400
        success = save_user_data(data)
        if success:
            return jsonify({'status': 'success', 'message': 'Data saved successfully'}), 200
        else:
            return jsonify({'status': 'error', 'message': 'Failed to save data'}), 500
    except Exception as e:
        print(f"Error in save_user_data: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/upload_file', methods=['POST'])
def upload_file():
    try:
        session_id = request.form.get('session_id')
        operation = request.form.get('operation')
        is_valid, message = validate_session(session_id, operation)
        if not is_valid:
            return jsonify({'error': message}), 400
        if operation != active_sessions[session_id]['current_operation']:
            clear_session_files(session_id)
            active_sessions[session_id]['current_operation'] = operation
        files = request.files.getlist('files')
        if not files:
            return jsonify({'error': 'No files uploaded'}), 400
        file_info = []
        for file in files:
            file_content = file.read()
            file_data = {
                'filename': file.filename,
                'content': file_content,
                'size': len(file_content),
                'upload_time': datetime.now()
            }
            active_sessions[session_id]['uploaded_files'][file.filename] = file_data
            file_info.append({
                'name': file.filename,
                'size': file_data['size'],
                'type': 'pdf' if file.filename.lower().endswith('.pdf') else 'image'
            })
        return jsonify({
            'status': 'success',
            'files': file_info,
            'operation': operation,
            'message': f'File uploaded for {operation} operation'
        })
    except Exception as e:
        print(f"Upload error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/get_file_info', methods=['POST'])
def get_file_info():
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        is_valid, message = validate_session(session_id)
        if not is_valid:
            return jsonify({'error': message}), 400
        session = active_sessions[session_id]
        if not session['uploaded_files']:
            return jsonify({'error': 'No files uploaded'}), 400
        
        # Check if it's PDF to get page count
        first_file = next(iter(session['uploaded_files'].values()))
        file_content = io.BytesIO(first_file['content'])
        
        if first_file['filename'].lower().endswith('.pdf'):
            try:
                reader = PdfReader(file_content)
                num_pages = len(reader.pages)
                return jsonify({
                    'pages': num_pages,
                    'size': first_file['size'],
                    'filename': first_file['filename'],
                    'operation': session['current_operation'],
                    'file_type': 'pdf'
                })
            except Exception as e:
                return jsonify({'error': f'Invalid PDF file: {str(e)}'}), 400
        else:
            # For images, we don't have pages
            return jsonify({
                'pages': 1,
                'size': first_file['size'],
                'filename': first_file['filename'],
                'operation': session['current_operation'],
                'file_type': 'image'
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# PDF Operations
@app.route('/api/merge', methods=['POST'])
def merge_pdfs():
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        is_valid, message = validate_session(session_id, 'merge')
        if not is_valid:
            return jsonify({'error': message}), 400
        session = active_sessions[session_id]
        if len(session['uploaded_files']) < 2:
            return jsonify({'error': 'At least 2 files required'}), 400
        
        writer = PdfWriter()
        # Sort files by filename to maintain order
        sorted_files = sorted(session['uploaded_files'].items(), key=lambda x: x[0])
        
        for filename, file_data in sorted_files:
            try:
                pdf_content = io.BytesIO(file_data['content'])
                # Reset stream position
                pdf_content.seek(0)
                reader = PdfReader(pdf_content)
                for page in reader.pages:
                    # Clone page to avoid reference issues
                    writer.add_page(page)
            except Exception as e:
                return jsonify({'error': f'Error reading {filename}: {str(e)}'}), 400
        
        output = io.BytesIO()
        writer.write(output)
        output.seek(0)
        clear_session_files(session_id)
        return send_file(output, mimetype='application/pdf', as_attachment=True, download_name='PDFNest_Merged.pdf')
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/split', methods=['POST'])
def split_pdf():
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        split_page = int(data.get('page'))
        is_valid, message = validate_session(session_id, 'split')
        if not is_valid:
            return jsonify({'error': message}), 400
        session = active_sessions[session_id]
        if not session['uploaded_files']:
            return jsonify({'error': 'No file uploaded'}), 400
        pdf_file = next(iter(session['uploaded_files'].values()))
        pdf_content = io.BytesIO(pdf_file['content'])
        pdf_content.seek(0)  # Reset stream position
        reader = PdfReader(pdf_content)
        total_pages = len(reader.pages)
        if split_page >= total_pages or split_page < 1:
            return jsonify({'error': f'Invalid split page. PDF has {total_pages} pages'}), 400
        writer1 = PdfWriter()
        writer2 = PdfWriter()
        for i in range(split_page):
            writer1.add_page(reader.pages[i])
        for i in range(split_page, total_pages):
            writer2.add_page(reader.pages[i])
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            pdf1 = io.BytesIO()
            writer1.write(pdf1)
            pdf1.seek(0)
            zip_file.writestr('PDFNest_Part1.pdf', pdf1.read())
            pdf2 = io.BytesIO()
            writer2.write(pdf2)
            pdf2.seek(0)
            zip_file.writestr('PDFNest_Part2.pdf', pdf2.read())
        zip_buffer.seek(0)
        clear_session_files(session_id)
        return send_file(zip_buffer, mimetype='application/zip', as_attachment=True, download_name='PDFNest_Split.zip')
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/delete', methods=['POST'])
def delete_pages():
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        pages_str = data.get('pages')
        is_valid, message = validate_session(session_id, 'delete')
        if not is_valid:
            return jsonify({'error': message}), 400
        session = active_sessions[session_id]
        if not session['uploaded_files']:
            return jsonify({'error': 'No file uploaded'}), 400
        pdf_file = next(iter(session['uploaded_files'].values()))
        pdf_content = io.BytesIO(pdf_file['content'])
        pdf_content.seek(0)  # Reset stream position
        reader = PdfReader(pdf_content)
        total_pages = len(reader.pages)
        writer = PdfWriter()
        pages_to_delete = set()
        for part in pages_str.split(','):
            part = part.strip()
            if '-' in part:
                start, end = map(int, part.split('-'))
                pages_to_delete.update(range(start-1, end))
            else:
                pages_to_delete.add(int(part)-1)
        for i, page in enumerate(reader.pages):
            if i not in pages_to_delete:
                writer.add_page(page)
        if len(writer.pages) == 0:
            return jsonify({'error': 'Cannot delete all pages'}), 400
        output = io.BytesIO()
        writer.write(output)
        output.seek(0)
        clear_session_files(session_id)
        return send_file(output, mimetype='application/pdf', as_attachment=True, download_name='PDFNest_Deleted_Pages.pdf')
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reorder', methods=['POST'])
def reorder_pages():
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        order_str = data.get('order')
        is_valid, message = validate_session(session_id, 'reorder')
        if not is_valid:
            return jsonify({'error': message}), 400
        session = active_sessions[session_id]
        if not session['uploaded_files']:
            return jsonify({'error': 'No file uploaded'}), 400
        pdf_file = next(iter(session['uploaded_files'].values()))
        pdf_content = io.BytesIO(pdf_file['content'])
        pdf_content.seek(0)  # Reset stream position
        reader = PdfReader(pdf_content)
        writer = PdfWriter()
        new_order = [int(x.strip())-1 for x in order_str.split(',')]
        for page_num in new_order:
            if page_num < 0 or page_num >= len(reader.pages):
                return jsonify({'error': f'Invalid page number: {page_num + 1}'}), 400
            writer.add_page(reader.pages[page_num])
        output = io.BytesIO()
        writer.write(output)
        output.seek(0)
        clear_session_files(session_id)
        return send_file(output, mimetype='application/pdf', as_attachment=True, download_name='PDFNest_Reordered.pdf')
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

def compress_pdf_fallback(original_content, level, session_id):
    """Fallback compression using PyPDF2 when PyMuPDF is not available"""
    try:
        pdf_content = io.BytesIO(original_content)
        pdf_content.seek(0)
        reader = PdfReader(pdf_content)
        writer = PdfWriter()
        
        # Add all pages with compression
        for page in reader.pages:
            page.compress_content_streams()
            writer.add_page(page)
        
        # Handle metadata based on compression level
        if level == 'high':
            writer.add_metadata({})  # Remove all metadata
        elif level == 'medium' and reader.metadata:
            # Keep only title and author
            clean_metadata = {}
            if '/Title' in reader.metadata:
                clean_metadata['/Title'] = reader.metadata['/Title']
            if '/Author' in reader.metadata:
                clean_metadata['/Author'] = reader.metadata['/Author']
            writer.add_metadata(clean_metadata)
        else:  # low compression
            if reader.metadata:
                writer.add_metadata(reader.metadata)
        
        output = io.BytesIO()
        writer.write(output)
        output.seek(0)
        compressed_content = output.getvalue()
        
        reduction = ((len(original_content) - len(compressed_content)) / len(original_content) * 100)
        print(f"PyPDF2 Fallback: Original: {len(original_content)} bytes, Compressed: {len(compressed_content)} bytes, Reduction: {reduction:.1f}%")
        
        output_final = io.BytesIO(compressed_content)
        output_final.seek(0)
        clear_session_files(session_id)
        return send_file(output_final, mimetype='application/pdf', as_attachment=True, download_name='PDFNest_Compressed.pdf')
        
    except Exception as e:
        print(f"Fallback compression failed: {e}")
        # Return original if all compression fails
        output_final = io.BytesIO(original_content)
        output_final.seek(0)
        clear_session_files(session_id)
        return send_file(output_final, mimetype='application/pdf', as_attachment=True, download_name='PDFNest_Compressed.pdf')
    
    
@app.route('/api/compress', methods=['POST'])
def compress_pdf():
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        level = data.get('level', 'medium')
        is_valid, message = validate_session(session_id, 'compress')
        if not is_valid:
            return jsonify({'error': message}), 400
        session = active_sessions[session_id]
        if not session['uploaded_files']:
            return jsonify({'error': 'No file uploaded'}), 400
        
        pdf_file = next(iter(session['uploaded_files'].values()))
        original_content = pdf_file['content']
        original_size = len(original_content)
        
        print(f"Starting compression: Level={level}, Original size={original_size} bytes")
        
        # Try PyMuPDF first (most effective)
        try:
            import fitz  # PyMuPDF
            import tempfile
            import os
            
            # Create temporary files
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as input_temp:
                input_temp.write(original_content)
                input_path = input_temp.name
            
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as output_temp:
                output_path = output_temp.name
            
            # Open the PDF
            doc = fitz.open(input_path)
            
            if level == 'low':
                # Light Compression: Basic optimization
                doc.save(output_path, garbage=4, deflate=True, clean=True)
                
            elif level == 'medium':
                # Medium Compression: Remove images
                for page_num in range(len(doc)):
                    page = doc[page_num]
                    image_list = page.get_images()
                    
                    # Remove images
                    for img in image_list:
                        try:
                            doc._deleteObject(img[0])
                        except:
                            continue  # Skip if deletion fails
                
                doc.save(output_path, garbage=4, deflate=True, clean=True)
                
            elif level == 'high':
                # Strong Compression: Rasterize pages to images
                new_doc = fitz.open()
                
                for page_num in range(len(doc)):
                    page = doc[page_num]
                    
                    # Create pixmap with lower DPI for high compression
                    mat = fitz.Matrix(1.2, 1.2)  # Lower resolution = smaller file
                    pix = page.get_pixmap(matrix=mat, alpha=False)
                    
                    # Convert to JPEG (automatically compressed)
                    img_data = pix.tobytes("jpeg")
                    
                    # Create new page
                    new_page = new_doc.new_page(width=pix.width, height=pix.height)
                    
                    # Insert compressed image
                    new_page.insert_image(new_page.rect, stream=img_data)
                
                new_doc.save(output_path, garbage=4, deflate=True)
                new_doc.close()
            
            doc.close()
            
            # Read compressed content
            with open(output_path, 'rb') as f:
                compressed_content = f.read()
            
            # Cleanup temporary files
            try:
                os.unlink(input_path)
                os.unlink(output_path)
            except:
                pass
            
            compressed_size = len(compressed_content)
            reduction = ((original_size - compressed_size) / original_size * 100) if original_size > 0 else 0
            
            print(f"PyMuPDF Success: {original_size} → {compressed_size} bytes, Reduction: {reduction:.1f}%")
            
            output_final = io.BytesIO(compressed_content)
            output_final.seek(0)
            clear_session_files(session_id)
            return send_file(output_final, mimetype='application/pdf', as_attachment=True, download_name='PDFNest_Compressed.pdf')
            
        except ImportError:
            # PyMuPDF not available, use PyPDF2 fallback
            print("PyMuPDF not available, using PyPDF2 fallback")
            return compress_pdf_fallback(original_content, level, session_id)
            
        except Exception as e:
            print(f"PyMuPDF compression failed: {str(e)}")
            # If PyMuPDF fails, try PyPDF2 fallback
            return compress_pdf_fallback(original_content, level, session_id)
            
    except Exception as e:
        print(f"Compression error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/convert', methods=['POST'])
def convert_file():
    try:
        data = request.form
        session_id = data.get('session_id')
        format_to = data.get('format')
        is_valid, message = validate_session(session_id, 'convert')
        if not is_valid:
            return jsonify({'error': message}), 400
        session = active_sessions[session_id]
        if not session['uploaded_files']:
            return jsonify({'error': 'No file uploaded'}), 400
        
        # Handle multiple files for images to PDF conversion
        if format_to == 'pdf' and len(session['uploaded_files']) > 0:
            # Check if all files are images
            image_files = []
            for file_data in session['uploaded_files'].values():
                if any(file_data['filename'].lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.gif', '.bmp']):
                    image_files.append(file_data)
            
            if image_files:
                # Multiple images to PDF
                images = []
                for file_data in image_files:
                    img = Image.open(io.BytesIO(file_data['content']))
                    if img.mode != 'RGB':
                        img = img.convert('RGB')
                    images.append(img)
                
                # Create PDF from images
                if images:
                    pdf_bytes = io.BytesIO()
                    images[0].save(
                        pdf_bytes, 
                        'PDF', 
                        save_all=True, 
                        append_images=images[1:] if len(images) > 1 else []
                    )
                    pdf_bytes.seek(0)
                    clear_session_files(session_id)
                    return send_file(pdf_bytes, mimetype='application/pdf', as_attachment=True, download_name='PDFNest_Converted.pdf')
        
        # Single file operations
        file_data = next(iter(session['uploaded_files'].values()))
        file_content = io.BytesIO(file_data['content'])
        file_content.seek(0)  # Reset stream position
        filename = file_data['filename']
        file_ext = filename.split('.')[-1].lower()
        
        if format_to == 'docx' and file_ext == 'pdf':
            pdf_path = os.path.join(UPLOAD_FOLDER, f"temp_{uuid.uuid4()}.pdf")
            docx_path = os.path.join(UPLOAD_FOLDER, f"temp_{uuid.uuid4()}.docx")
            with open(pdf_path, 'wb') as f:
                f.write(file_content.getbuffer())
            cv = Converter(pdf_path)
            cv.convert(docx_path)
            cv.close()
            response = send_file(docx_path, as_attachment=True, download_name='PDFNest_Converted.docx')
            @response.call_on_close
            def cleanup():
                try:
                    os.remove(pdf_path)
                    os.remove(docx_path)
                    clear_session_files(session_id)
                except:
                    pass
            return response
            
        elif format_to == 'txt' and file_ext == 'pdf':
            file_content.seek(0)
            reader = PdfReader(file_content)
            text = ''
            for page_num, page in enumerate(reader.pages, 1):
                page_text = page.extract_text()
                text += f"--- Page {page_num} ---\n\n{page_text}\n\n" if page_text else f"--- Page {page_num} ---\n\n[No text content]\n\n"
            output = io.BytesIO(text.encode('utf-8'))
            output.seek(0)
            clear_session_files(session_id)
            return send_file(output, mimetype='text/plain', as_attachment=True, download_name='PDFNest_Converted.txt')
            
        elif format_to == 'jpg' and file_ext == 'pdf':
            # PDF to Images conversion - simplified version
            file_content.seek(0)
            reader = PdfReader(file_content)
            zip_buffer = io.BytesIO()
            
            with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                for page_num in range(len(reader.pages)):
                    # Create a placeholder image for each page
                    # In production, use pdf2image library for proper conversion
                    img = Image.new('RGB', (800, 1000), color='white')
                    img_bytes = io.BytesIO()
                    img.save(img_bytes, 'JPEG', quality=85)
                    img_bytes.seek(0)
                    zip_file.writestr(f'page_{page_num + 1}.jpg', img_bytes.read())
            
            zip_buffer.seek(0)
            clear_session_files(session_id)
            return send_file(zip_buffer, mimetype='application/zip', as_attachment=True, download_name='PDFNest_Converted_Images.zip')
            
        else:
            return jsonify({'error': 'Unsupported conversion'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

if __name__ == '__main__':
    print("=" * 60)
    print("PDF pilot - SEO Optimized Multi-Page Platform")
    print("=" * 60)
    print("Server: http://localhost:5000")
    print("Pages:")
    print("  / - Home")
    print("  /merge-pdf - Merge PDFs")
    print("  /split-pdf - Split PDF")
    print("  /delete-pdf-pages - Delete Pages")
    print("  /reorder-pdf-pages - Reorder Pages")
    print("  /compress-pdf - Compress PDF")
    print("  /convert-pdf - Convert Files")
    print("=" * 60)
    app.run(debug=True, port=5000, host='0.0.0.0')