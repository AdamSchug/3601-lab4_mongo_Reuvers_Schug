package umm3601.todo;

import com.mongodb.BasicDBObject;
import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.*;
import org.bson.codecs.*;
import org.bson.codecs.configuration.CodecRegistries;
import org.bson.codecs.configuration.CodecRegistry;
import org.bson.json.JsonReader;
import org.bson.types.ObjectId;
import org.junit.Before;
import org.junit.Test;

import java.util.*;
import java.util.stream.Collectors;

import static org.junit.Assert.*;

public class TodoControllerSpec {
  private TodoController todoController;
  private ObjectId terrysId;

  @Before
  public void clearAndPopulateDB() {
    MongoClient mongoClient = new MongoClient();
    MongoDatabase db = mongoClient.getDatabase("test");
    MongoCollection<Document> todoDocuments = db.getCollection("todos");
    todoDocuments.drop();
    List<Document> testTodos = new ArrayList<>();
    testTodos.add(Document.parse("{\n" +
      "                    owner: \"Steve\",\n" +
      "                    status: true,\n" +
      "                    body: \"Do the thing with the thing\",\n" +
      "                    category: \"one\"\n" +
      "                }"));
    testTodos.add(Document.parse("{\n" +
      "                    owner: \"Bilbo\",\n" +
      "                    status: false,\n" +
      "                    body: \"Do the thing with the other thing over there\",\n" +
      "                    category: \"two\"\n" +
      "                }"));
    testTodos.add(Document.parse("{\n" +
      "                    owner: \"Patricia\",\n" +
      "                    status: true,\n" +
      "                    body: \"Do the one thing with that other thing right here\",\n" +
      "                    category: \"three\"\n" +
      "                }"));

    terrysId = new ObjectId();
    BasicDBObject terry = new BasicDBObject("_id", terrysId);
    terry = terry.append("owner", "Terry")
      .append("status", false)
      .append("body", "TODO tasks")
      .append("category", "four");


    todoDocuments.insertMany(testTodos);
    todoDocuments.insertOne(Document.parse(terry.toJson()));

    todoController = new TodoController(db);
  }

  // http://stackoverflow.com/questions/34436952/json-parse-equivalent-in-mongo-driver-3-x-for-java
  private BsonArray parseJsonArray(String json) {
    final CodecRegistry codecRegistry
      = CodecRegistries.fromProviders(Arrays.asList(
      new ValueCodecProvider(),
      new BsonValueCodecProvider(),
      new DocumentCodecProvider()));

    JsonReader reader = new JsonReader(json);
    BsonArrayCodec arrayReader = new BsonArrayCodec(codecRegistry);

    return arrayReader.decode(reader, DecoderContext.builder().build());
  }

  private static String getOwner(BsonValue val) {
    BsonDocument doc = val.asDocument();
    return ((BsonString) doc.get("owner")).getValue();
  }

  @Test
  public void getAllTodos() {
    Map<String, String[]> emptyMap = new HashMap<>();
    String jsonResult = todoController.getTodos(emptyMap);
    BsonArray docs = parseJsonArray(jsonResult);

    assertEquals("Should be 4 todos", 4, docs.size());
    List<String> owners = docs
      .stream()
      .map(TodoControllerSpec::getOwner)
      .sorted()
      .collect(Collectors.toList());
    List<String> expectedOwners = Arrays.asList("Bilbo", "Patricia", "Steve", "Terry");
    assertEquals("Owners should match", expectedOwners, owners);
  }

  @Test
  public void getTerryById() {
    String jsonResult = todoController.getTodo(terrysId.toHexString());
    Document terry = Document.parse(jsonResult);
    assertEquals("Owner should match", "Terry", terry.get("owner"));
    String noJsonResult = todoController.getTodo(new ObjectId().toString());
    assertNull("No owner should match", noJsonResult);

  }

  @Test
  public void addTodoTest() {
    String newId = todoController.addNewTodo("Adam", true, "Senior Sem", "five");

    assertNotNull("Add new todo should return true when todo is added,", newId);
    Map<String, String[]> argMap = new HashMap<>();
    argMap.put("status", new String[]{"true"});
    String jsonResult = todoController.getTodos(argMap);
    BsonArray docs = parseJsonArray(jsonResult);

    List<String> owner = docs
      .stream()
      .map(TodoControllerSpec::getOwner)
      .sorted()
      .collect(Collectors.toList());
    assertEquals("Should return name of new todo", "Adam", owner.get(0));
  }

  @Test
  public void getTodoByOwner() {
    Map<String, String[]> argMap = new HashMap<>();
    argMap.put("owner", new String[]{"[B]"});
    String jsonResult = todoController.getTodos(argMap);
    BsonArray docs = parseJsonArray(jsonResult);
    assertEquals("Should be 1 todos", 1, docs.size());
    List<String> owner = docs
      .stream()
      .map(TodoControllerSpec::getOwner)
      .sorted()
      .collect(Collectors.toList());
    List<String> expectedOwner = Arrays.asList("Bilbo");
    assertEquals("Owners should match", expectedOwner, owner);
  }

  @Test
  public void getTodoByStatus() {
    Map<String, String[]> argMap = new HashMap<>();
    argMap.put("status", new String[]{"true"});
    String jsonResult = todoController.getTodos(argMap);
    BsonArray docs = parseJsonArray(jsonResult);

    assertEquals("Should be 2 todos", 2, docs.size());
    List<String> owners = docs
      .stream()
      .map(TodoControllerSpec::getOwner)
      .sorted()
      .collect(Collectors.toList());
    List<String> expectedOwners = Arrays.asList("Patricia", "Steve");
    assertEquals("Owners should match", expectedOwners, owners);
  }

  @Test
  public void getTodoByBody() {
    Map<String, String[]> argMap = new HashMap<>();
    argMap.put("body", new String[]{"task"});
    String jsonResult = todoController.getTodos(argMap);
    BsonArray docs = parseJsonArray(jsonResult);
    assertEquals("Should be 1 todos", 1, docs.size());
    List<String> owner = docs
      .stream()
      .map(TodoControllerSpec::getOwner)
      .sorted()
      .collect(Collectors.toList());
    List<String> expectedOwner = Arrays.asList("Terry");
    assertEquals("Owners should match", expectedOwner, owner);
  }

  @Test
  public void getTodoByCategory() {
    Map<String, String[]> argMap = new HashMap<>();
    argMap.put("category", new String[]{"[t]"});
    String jsonResult = todoController.getTodos(argMap);
    BsonArray docs = parseJsonArray(jsonResult);
    assertEquals("Should be 2 todos", 2, docs.size());
    List<String> owner = docs
      .stream()
      .map(TodoControllerSpec::getOwner)
      .sorted()
      .collect(Collectors.toList());
    List<String> expectedOwner = Arrays.asList("Bilbo", "Patricia");
    assertEquals("Owners should match", expectedOwner, owner);
  }
}
