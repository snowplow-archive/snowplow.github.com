---
layout: post
title: Scripting Hadoop, Part One - Adventures with Scala, Rhino and JavaScript
title-short: Scripting Hadoop part one
tags: [snowplow, hadoop, scala, rhino, scriptengine, javascript, js]
author: Alex
category: Research
---


As we have got to know the Snowplow community better, it has become clear that many members have very specific event processing requirements including:

1. Custom trackers and collector logging formats
2. Custom event models
3. Custom business logic that impacts on the way their event data is processed

To date, we have relied on three main techniques to help Snowplow users meet these requirements:

1. Adding additional configuration options into the core Enrichment process (e.g. IP address anonymization, coming in 0.8.11)
2. Working with users on bespoke re-writes of the Snowplow Enrichment process (mostly forks of the Scalding ETL job)
3. Helping users to implement additional processing steps downstream of the current Enrichment/Storage processes (e.g. building reporting cubes in Hive or Redshift)

Each of these approaches has its strengths and weaknesses, and we will certainly continue to develop and improve all three. But we also want to explore if there is a "middle ground" between configuration options and fully bespoke code: can we somehow make the Snowplow Enrichment process user-scriptable?

If possible, the following approach would make an attractive middle ground:

1. Pass one or more user-authored scripts into our Scalding ETL at runtime
2. The user-authored script(s) are executed against each row of event data
3. These scripts can be written in a popular and easy-to-learn scripting language

Two technologies stood out as promising: Java's [ScriptEngine] [script-engine] and Mozilla's [Rhino] [rhino]. ScriptEngine is a technology bundled with J2SE 6+ which allows dynamic languages to be evaluated at runtime from Java; Rhino is an implementation of JavaScript written in Java and available to any JVM app through ScriptEngine.

The first step to test if this approach is viable, was to test out Rhino and Scala's inter-operation to see what was possible. In the rest of this blog post, we will reproduce that investigation as an interactive REPL (read-eval-print loop) session. To follow along, you will need to have SBT and Scala installed...

<!--more-->

First we clone our [Scalding Example Project] [scalding-example-project], available on GitHub. This gives us a Scala environment which we know successfully can run Scalding on Hadoop (including Elastic MapReduce), giving us some    confidence that whatever scripting works in this environment will ultimately work fine on EMR too.

So let's get started:

    $ git clone git@github.com:snowplow/scalding-example-project.git
    $ cd scalding-example-project
    $ sbt
    scalding-example-project > console
    scala>

Great, now we're in the Scala console within SBT, and we have access to all of the libraries loaded as part of the scalding-example-project should we need them.

Now let's create a JavaScript-powered ScriptEngine in Scala:

{% highlight scala %}
scala> val factory = new javax.script.ScriptEngineManager
factory: javax.script.ScriptEngineManager = javax.script.ScriptEngineManager@381ebaf3

scala> val engine = factory.getEngineByName("JavaScript")
engine: javax.script.ScriptEngine = com.sun.script.javascript.RhinoScriptEngine@75ee0563

scala> engine.eval("print('Hello, World\\n')")
Hello, World
res4: java.lang.Object = null
{% endhighlight %}

Excellent - we've now got JavaScript executing from Scala! For more information, check out the Javadoc for [ScriptEngineManager] [sem-javadoc] and [ScriptEngine] [se-javadoc].

As a next step, let's focus on the boundaries and get data flowing from Scala to JavaScript and back out again. Let's pass in a variable - I'm going to prepend dollar signs to all of my Scala-sourced JavaScript variables to make their origin clear:

{% highlight scala %}
scala> engine.put("$filter", "yeah")

scala> val isFiltered = engine.eval("($filter === \"yeah\") ? true : false;")
isFiltered: java.lang.Object = true
{% endhighlight %}

Great, that worked, although the return type java.lang.Object is obviously a little blunt. Now let's see what happens if we write some invalid JavaScript:

{% highlight scala %}
scala> val isFiltered = engine.eval("undefined.splice()")
javax.script.ScriptException: sun.org.mozilla.javascript.internal.EcmaError:
TypeError: Cannot call method "splice" of undefined (<Unknown source>#1) in
<Unknown source> at line number 1
{% endhighlight %}

Okay - this ScriptException is very similar to what you would see evaluating the same code in the Firefox or Chrome JavaScript consoles, so that's reassuring.

Let's try another failure scenario - where our JavaScript accidentally returns a Number when we are expecting a Boolean:

{% highlight scala %}
scala> val isFiltered = engine.eval("($filter === \"yeah\") ? 1 : 0;")
isFiltered: java.lang.Object = 1.0
{% endhighlight %}

The return type definitely looks problematic, although the problem won't manifest itself until we try to cast it into a Boolean. So let's put together an example with some type safety:

{% highlight scala %}
scala> import PartialFunction._
import PartialFunction._

scala> def evalAsBoolean(script: String): Option[Boolean] =
    condOpt(engine.eval(script): Any) { case b: Boolean => b }
evalAsBoolean: (script: String)Option[Boolean]

scala> evalAsBoolean("($filter === \"yeah\") ? true : false;")
res30: Option[Boolean] = Some(true)

scala> evalAsBoolean("($filter === \"yeah\") ? 1 : 0;")
res30: Option[Boolean] = None
{% endhighlight %}

Perfect! We have wrapped our JavaScript in some sensible Scala types. For more information on the `condOpt` "magic", check out [this Stack Overflow answer] [cond-opt] to _"How to cast java.lang.Object to a specific type in Scala?"_.

Let's try something a little more ambitious now. Can we mutate a POJO ("plain old Java object") from inside JavaScript? Only one way to find out:

{% highlight scala %}
scala> class MyPojo { @scala.reflect.BeanProperty var myVar: String = "heart scala" }
defined class MyPojo
{% endhighlight %}

{% highlight scala %}
scala> val myPojo = new MyPojo
myPojo: MyPojo = MyPojo@2bbf1be2

scala> engine.put("$myPojo", myPojo)

scala> engine.eval("$myPojo.myVar = \"heart js\";")
javax.script.ScriptException: sun.org.mozilla.javascript.internal.EvaluatorException:
Java method "myVar" cannot be assigned to. (<Unknown source>#1) in <Unknown source>
at line number 1
{% endhighlight %}

Oh dear! It looks like Java and Scala's getters and setters sugar doesn't translate well into JavaScript. So let's try the actual setter method, and then print using the getter:

{% highlight scala %}
scala> engine.eval("$myPojo.setMyVar(\"heart js\")")
res10: java.lang.Object = null

scala> engine.eval("print($myPojo.myVar() + \"\\n\")")
heart js
res20: java.lang.Object = null
{% endhighlight %}

Okay great - the mutation seems to be working. And note that trailing semi-colons are optional, just as they are in "real" JavaScript. Now let's try and get our POJO back out into our Scala context:

{% highlight scala %}
scala> val myPojoRedux = engine.get("$myPojo") match {
    case p: MyPojo => p
    case _ => throw new ClassCastException
}
myPojoRedux: MyPojo = MyPojo@2bbf1be2

scala> myPojoRedux.myVar
res26: String = heart js
{% endhighlight %}

Done! So we have made some progress: we have mutated a POJO inside of JavaScript using the de-sugared setter and getter forms.

Okay, what's the situation with Scala case classes? Obviously we won't try to mutate them inside of JavaScript, but it would be great if we can at least see their contents:

{% highlight scala %}
scala> case class MyCaseClass(myVal: String)
defined class MyCaseClass

scala> val myCC = MyCaseClass("can't touch this")
myCaseClass: MyCaseClass = MyCaseClass(can't touch this)

scala> engine.put("$myCaseClass", myCC)

scala> engine.eval("print($myCaseClass.myVal() + \"\\n\")")
can't touch this
res35: java.lang.Object = null
{% endhighlight %}

Great! We can see inside Scala case classes without any particular fuss.

We're almost done for our first blog post - of course, we haven't touched Hadoop yet, but we have a much better understanding of how we can script Scala programs (and so hopefully Scalding jobs) using JavaScript.

Before we go, let's try to generalize our `evalAsBoolean()` method above into something a little bit more reusable. How about a method with a signature like this:

{% highlight scala %}
/**
 * Evaluate some JavaScript into a Some(Boolean),
 * returning None if this evaluation failed.
 *
 * @param js The JavaScript to evaluate
 * @param vars A Map of variables to pass into
 * the JavaScript
 * @return An Option-boxed Boolean
 */
def evalAsBoolean(js: String, vars: Map[String, Object]): Option[Boolean]
{% endhighlight %}

Hopefully the function arguments and return value are fairly clear, so let's proceed to the whole function definition:

{% highlight scala %}
import javax.script.ScriptEngineManager
import PartialFunction._

/**
 * Evaluate some JavaScript into a Some(Boolean),
 * returning None if this evaluation failed.
 *
 * @param js The JavaScript to evaluate
 * @param vars A Map of variables to pass into
 * the JavaScript
 * @return An Option-boxed Boolean
 */
def evalAsBoolean(js: String, vars: Map[String, Object]): Option[Boolean] = {

    val factory = new ScriptEngineManager
    val engine = factory.getEngineByName("JavaScript")

    val prependDollar = (v: String) => if (v.startsWith("$")) v else "$%s".format(v)
    for ((k, v) <- vars) engine.put(prependDollar(k), v)

    try {
        condOpt(engine.eval(js): Any) {
            case b: Boolean => b
        }
    } catch {
        case se: javax.script.ScriptException => None
    }
}
{% endhighlight %}

Paste that into the Scala console in SBT and you should see:

{% highlight scala %}
evalAsBoolean: (js: String, vars: Map[String,java.lang.Object])Option[Boolean]
{% endhighlight %}

Now let's try this out - first with a script which should evaluate to true:

{% highlight scala %}
scala> val vars1 = Map[String, Object](
"one" -> new java.lang.Integer(1),
"$two" -> new java.lang.Integer(2)
)
vars1: scala.collection.immutable.Map[String,java.lang.Object] = Map(one -> 1, $two -> 2)

scala> val js1 = "($one + $two) === 3;"
js1: java.lang.String = ($one + $two) === 3

scala> evalAsBoolean(js1, vars1)
res1: Option[Boolean] = Some(true)
{% endhighlight %}

Now a false value, involving checking a property inside of a case class:

{% highlight scala %}
scala> case class ALang(aLang: String)
defined class ALang

scala> val vars2 = Map[String, Object]("lang" -> ALang("dart"))
vars2: scala.collection.immutable.Map[String,java.lang.Object] = Map(lang -> ALang(dart))

scala> val js2 = "$lang.aLang() === \"js\";"
js2: java.lang.String = $lang.aLang() === "js"

scala> evalAsBoolean(js2, vars2)
res2: Option[Boolean] = Some(false)
{% endhighlight %}

That's working a treat. Now let's try evaluating an invalid piece of JavaScript:

{% highlight scala %}
scala> val js3 = "$doesNotExist.arg()"
js3: java.lang.String = $doesNotExist.arg()

scala> evalAsBoolean(js3, vars2)
res3: Option[Boolean] = None
{% endhighlight %}

Good, and finally a valid piece of JavaScript but one which returns a String when we want a Boolean:

{% highlight scala %}
scala> val js4 = "\"I heart \" + $lang.aLang();"
js4: java.lang.String = "I heart " + $lang.aLang();

scala> evalAsBoolean(js4, vars2)
res4: Option[Boolean] = None
{% endhighlight %}

Great! Those are all behaving as expected. We're going to pause here, but we've already made some good progress understanding how JavaScript can be invoked at runtime from a Scala environment.

In the next post, we will take these learnings and start to apply them within a Scalding environment, with the aim of getting some basic user-defined JavaScript executing on Elastic MapReduce. Stay tuned for the next installment!

If you're interested in adapting Snowplow's technology to meet your custom event processing needs, and would like to discuss your requirements with the Snowplow team, then [get in touch] [contact].


[rhino]: https://developer.mozilla.org/en/docs/Rhino
[script-engine]: http://docs.oracle.com/javase/6/docs/technotes/guides/scripting/programmer_guide/#jsengine
[scalding-example-project]: https://github.com/snowplow/scalding-example-project

[sem-javadoc]: http://download.java.net/jdk6/archive/b104/docs/api/javax/script/ScriptEngineManager.html
[se-javadoc]: http://download.java.net/jdk6/archive/b104/docs/api/javax/script/ScriptEngine.html

[cond-opt]: http://stackoverflow.com/a/9828815/255627
[contact]: /about/index.html



[rhino]: https://developer.mozilla.org/en/docs/Rhino
[script-engine]: http://docs.oracle.com/javase/6/docs/technotes/guides/scripting/programmer_guide/#jsengine
[scalding-example-project]: https://github.com/snowplow/scalding-example-project

[sem-javadoc]: http://download.java.net/jdk6/archive/b104/docs/api/javax/script/ScriptEngineManager.html
[se-javadoc]: http://download.java.net/jdk6/archive/b104/docs/api/javax/script/ScriptEngine.html

[cond-opt]: http://stackoverflow.com/a/9828815/255627
[contact]: /about/index.html
